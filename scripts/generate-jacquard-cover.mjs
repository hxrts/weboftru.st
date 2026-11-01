// Abstract editorial artwork, not a simulation trace or physical field solution.
// Deterministic geometry keeps the cover editable and reproducible.
import { writeFileSync } from 'node:fs';
const nodes = [
 [85,190],[183,85],[278,180],[160,340],
 [625,225],
 [430,675],[575,530],[635,780],[795,640],
 [870,355],
 [1100,160],[1030,420],[1210,290],[1310,480],
];
const edges = [
 [0,1],[0,2],[0,3],[1,2],[2,3],[2,4],[3,5],
 [5,6],[5,7],[6,7],[6,8],[7,8],[4,9],[8,9],
 [9,10],[9,11],[10,12],[11,12],[11,13],[12,13],[8,11],
];
const blue='#397a9e',amber=blue,coral=blue;
const out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900" role="img" aria-labelledby="mesh-title mesh-desc">',
 '<title id="mesh-title">Adaptive mesh routing</title>',
 '<desc id="mesh-desc">Field lines branch from a single source through irregular mesh clusters and sparse bridges, then converge at one destination. Blue paths suggest alternate routes.</desc>'];
const f=n=>Number(n.toFixed(2));
function curve(a,b,bend=0){
 const [x,y]=nodes[a],[u,v]=nodes[b],dx=u-x,dy=v-y,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
 return `M${x},${y} C${f(x+dx*.28+nx*bend)},${f(y+dy*.28+ny*bend)} ${f(x+dx*.72+nx*bend)},${f(y+dy*.72+ny*bend)} ${u},${v}`;
}
// Smooth streams continue across several relays instead of restarting at each edge.
function stream(indices, offset) {
 const points=indices.map((index,i)=>{
  const p=nodes[index],prev=nodes[indices[Math.max(0,i-1)]],next=nodes[indices[Math.min(indices.length-1,i+1)]];
  const dx=next[0]-prev[0],dy=next[1]-prev[1],length=Math.hypot(dx,dy);
  // Bundles narrow at shared relays and expand through the sparse gaps.
  const width=(i===0||i===indices.length-1)?0:([2,6,9,11].includes(index)? .45:1.15);
  return [p[0]-dy/length*offset*width,p[1]+dx/length*offset*width];
 });
 let d=`M${points[0].map(f).join(',')}`;
 for(let i=0;i<points.length-1;i++){
  const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],e=points[Math.min(points.length-1,i+2)];
  d+=` C${f(b[0]+(c[0]-a[0])/6)},${f(b[1]+(c[1]-a[1])/6)} ${f(c[0]-(e[0]-b[0])/6)},${f(c[1]-(e[1]-b[1])/6)} ${c.map(f).join(',')}`;
 }
 return d;
}
const streams=[
 {nodes:[0,1,2,4,9,10,12,13],color:blue},
 {nodes:[0,2,4,9,11,13],color:blue},
 {nodes:[0,3,5,6,8,9,11,12,13],color:blue},
 {nodes:[0,3,5,7,8,11,13],color:blue},
];
out.push('<g fill="none" stroke-linecap="round">');
for(const flow of streams){
 for(let k=-8;k<=8;k++){
  out.push(`<path d="${stream(flow.nodes,k*7)}" stroke="${flow.color}" stroke-width="1.2" opacity=".28"/>`);
 }
}
// Coral traces follow the same flow grammar through contested cluster centers.
for(const indices of [streams[0].nodes,streams[2].nodes]){
 for(let k=-5;k<=5;k++)out.push(`<path d="${stream(indices,k*5)}" stroke="${coral}" stroke-width="1.2" opacity=".28"/>`);
}
out.push('</g>');
const routes=[
 {nodes:[0,2,4,9,11,13],color:blue,bend:14},
 {nodes:[0,3,5,7,8,11,13],color:blue,bend:-15},
];
for(const route of routes){
 out.push(`<g fill="none" stroke="${route.color}" stroke-linecap="round">`);
 for(let j=1;j<route.nodes.length;j++){
 const d=curve(route.nodes[j-1],route.nodes[j],route.bend);
 out.push(`<path d="${d}" stroke-width="17" opacity=".14"/>`,`<path d="${d}" stroke-width="1.2" opacity=".65"/>`);
 }out.push('</g>');
}
out.push('<g fill="none" stroke="#4c5963" stroke-width="1" opacity=".65">');
for(const [a,b] of edges)out.push(`<path d="${curve(a,b)}"/>`);
out.push('</g>','<g stroke="#34434b" stroke-width="1.3">');
nodes.forEach(([x,y],i)=>out.push(`<circle cx="${x}" cy="${y}" r="${[0,13].includes(i)?10:([2,6,9,11].includes(i)?9:7)}" fill="#b3e5fc"/>`));
out.push('</g>','</svg>');
writeFileSync(new URL('../static/images/adaptive-mesh-routing.svg',import.meta.url),out.join('\n')+'\n');
