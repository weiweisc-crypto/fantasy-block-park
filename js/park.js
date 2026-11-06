/*
 * 3D 遊樂園（沿用 GPT 原版的場景程式）：一座不規則大型主島、四座小島、十個設施（含立體瓦片屋頂與小屋裝飾）、海洋、鯨魚與海豚、雲朵動畫。
 * 設施名稱與任務在 config/park-zones.js；點「彩虹飲品屋」會開啟第一關（js/level-one.js）。
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { startLevelOne, getFirstLevelStars } from './level-one.js';
import { ZONES } from '../config/park-zones.js';

history.scrollRestoration='manual';
const canvas = document.querySelector('#world');
const wrap = document.querySelector('#canvasWrap');
const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(wrap.clientWidth,wrap.clientHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xd9f4f4);
scene.fog=new THREE.Fog(0xd9f4f4,64,120);
const camera=new THREE.OrthographicCamera(-19,19,16,-16,.1,140);
camera.position.set(31,28,36);
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;
controls.dampingFactor=.065;
controls.minZoom=.75;
controls.maxZoom=3;
controls.maxPolarAngle=Math.PI*.44;
controls.minPolarAngle=Math.PI*.16;
controls.enablePan=false;
controls.target.set(0,.5,0);
controls.update();

scene.add(new THREE.HemisphereLight(0xffffff,0xd4e6bc,1.55));
const sun=new THREE.DirectionalLight(0xfff5d5,2.25);sun.position.set(-9,18,11);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-25;sun.shadow.camera.right=25;sun.shadow.camera.top=25;sun.shadow.camera.bottom=-25;sun.shadow.normalBias=.035;scene.add(sun);
const fill=new THREE.DirectionalLight(0xcfe5ff,.9);fill.position.set(11,10,-10);scene.add(fill);

const mat=(color,roughness=.86)=>new THREE.MeshStandardMaterial({color,roughness,metalness:0,flatShading:true});
const mats={grass:mat(0x87c873),grass2:mat(0x69ae65),edge:mat(0x6fbb6b),dirt:mat(0xc99561),cream:mat(0xffedbe),gold:mat(0xf9c94d),white:mat(0xfffcf2),pink:mat(0xf69abb),red:mat(0xf06764),blue:mat(0x72a8de),mint:mat(0x8bd8bd),wood:mat(0xae795d),dark:mat(0x436c61)};
function mesh(geo,material,parent=scene,x=0,y=0,z=0){const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function box(w,h,d,material,parent,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),material,parent,x,y,z)}
function sphere(r,material,parent,x=0,y=0,z=0,segments=12){return mesh(new THREE.SphereGeometry(r,segments,8),material,parent,x,y,z)}
function cyl(rt,rb,h,material,parent,x=0,y=0,z=0,seg=12){return mesh(new THREE.CylinderGeometry(rt,rb,h,seg),material,parent,x,y,z)}
function cone(r,h,material,parent,x=0,y=0,z=0,seg=10){return mesh(new THREE.ConeGeometry(r,h,seg),material,parent,x,y,z)}
function torus(r,t,material,parent,x=0,y=0,z=0,seg=18){return mesh(new THREE.TorusGeometry(r,t,8,seg),material,parent,x,y,z)}
function tube(points,r,material,parent=scene){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),60,r,6,false),material,parent)}
function textTexture(title,stars,maxStars=3){const c=document.createElement('canvas');c.width=512;c.height=220;const ctx=c.getContext('2d');ctx.shadowColor='#35644755';ctx.shadowBlur=22;ctx.shadowOffsetY=10;ctx.fillStyle='#fffdf1';ctx.beginPath();ctx.roundRect(18,15,476,170,29);ctx.fill();ctx.shadowColor='transparent';ctx.fillStyle='#39845e';ctx.beginPath();ctx.roundRect(34,31,65,26,13);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 17px sans-serif';ctx.textAlign='center';ctx.fillText('關卡',67,50);ctx.fillStyle='#294939';ctx.font='bold 43px "Microsoft JhengHei",sans-serif';ctx.textAlign='left';ctx.fillText(title,35,105);ctx.font='39px sans-serif';for(let i=0;i<maxStars;i++){ctx.fillStyle=i<stars?'#efc348':'#d7ded0';ctx.fillText('★',35+i*42,156)}const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex}

// A wide, uneven main island and four small, individually shaped satellite islands.
const seaLevel=-3.2;
const sea=mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshStandardMaterial({color:0x79ccdd,roughness:.43,metalness:.02,flatShading:true}),scene,0,seaLevel,0);sea.rotation.x=-Math.PI/2;sea.castShadow=false;
const foam=new THREE.MeshBasicMaterial({color:0xe4fff5,transparent:true,opacity:.36,depthWrite:false});
function radialOutline(rx,rz,seed,count=28){const pts=[];for(let i=0;i<count;i++){const a=i/count*Math.PI*2;const wave=1+.095*Math.sin(a*3+seed)+.065*Math.sin(a*5-seed*1.7)+.04*Math.cos(a*9+seed*.8);pts.push([Math.cos(a)*rx*wave,Math.sin(a)*rz*wave])}return pts}
function irregularLand(cx,cz,rx,rz,topY,bottomY,seed,topColor=0x88c979){
  const contour=radialOutline(rx,rz,seed,rx>6?34:18),n=contour.length,vertices=[],colors=[];
  const grass=new THREE.Color(topColor),greenSide=new THREE.Color(0x64ab6c),soil=new THREE.Color(0xc49b72),soilDark=new THREE.Color(0xa97e60),sand=new THREE.Color(0xe6ce9e);
  function tri(a,b,c,color){for(const p of [a,b,c]){vertices.push(...p);colors.push(color.r,color.g,color.b)}}
  for(let i=0;i<n;i++){const p=contour[i],q=contour[(i+1)%n],tone=grass.clone().multiplyScalar(.95+(i%4)*.025);tri([cx,topY,cz],[cx+p[0],topY,cz+p[1]],[cx+q[0],topY,cz+q[1]],tone)}
  const rings=[[1,topY,grass],[1.025,topY-.26,greenSide],[.99,topY-.57,sand],[.88,(topY+bottomY)/2,soil],[.67,bottomY,soilDark]];
  for(let r=0;r<rings.length-1;r++)for(let i=0;i<n;i++){const p=contour[i],q=contour[(i+1)%n],a=rings[r],b=rings[r+1];const v0=[cx+p[0]*a[0],a[1],cz+p[1]*a[0]],v1=[cx+q[0]*a[0],a[1],cz+q[1]*a[0]],v2=[cx+p[0]*b[0],b[1],cz+p[1]*b[0]],v3=[cx+q[0]*b[0],b[1],cz+q[1]*b[0]];const col=(r===0?greenSide:r===1?sand:r===2?soil:soilDark).clone().multiplyScalar(.92+((i*7+r)%5)*.035);tri(v0,v2,v1,col);tri(v1,v2,v3,col)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const land=mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1,side:THREE.DoubleSide}));land.castShadow=true;land.receiveShadow=true;
  for(let k=0;k<2;k++){const ripple=torus(Math.max(rx,rz)*(1.06+k*.08),.026,foam,scene,cx,seaLevel+.035,cz,36);ripple.rotation.x=-Math.PI/2;ripple.scale.y=rz/rx;ripple.castShadow=false}
  return land;
}
irregularLand(0,0,14.15,10.45,.45,seaLevel-.85,1.23,0x85c877);
const satelliteLand=[[-17.1,-10.6,3.35,3.05,.7,2.35,0x87c982],[19.1,-12.8,4.45,3.7,1.2,4.21,0x96cf80],[-19.3,11.5,3.9,3.55,.9,5.72,0x80c7a2],[16.4,13.3,3.25,3.0,1.55,3.47,0x8ecda8]];
for(const p of satelliteLand)irregularLand(p[0],p[1],p[2],p[3],p[4],seaLevel-.72,p[5],p[6]);

// Terraces lift two main attractions. Low-poly hills rise behind the park paths.
irregularLand(-6.4,3.25,2.55,2.22,1.1,.41,2.8,0x8dcb79);
irregularLand(6.5,2.8,2.55,2.15,.85,.41,4.1,0x92cf82);
function hill(cx,cz,rx,rz,height,seed){const rim=radialOutline(rx,rz,seed,15),verts=[],cols=[];const base=.34;for(let i=0;i<rim.length;i++){const p=rim[i],q=rim[(i+1)%rim.length],mid=[cx,base+height,cz],a=[cx+p[0],base+.03,cz+p[1]],b=[cx+q[0],base+.03,cz+q[1]],m=[cx+p[0]*.57,base+height*.65,cz+p[1]*.57],n=[cx+q[0]*.57,base+height*.65,cz+q[1]*.57];for(const [v0,v1,v2,c] of [[a,m,b,0x67b56e],[b,m,n,0x75bf72],[m,mid,n,0x90cf7a]]){const co=new THREE.Color(c);for(const v of [v0,v1,v2]){verts.push(...v);cols.push(co.r,co.g,co.b)}}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));geo.computeVertexNormals();mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,side:THREE.DoubleSide}))}
hill(-8.7,5.7,2.05,1.7,1.65,1.4);hill(3.9,6.25,2.35,1.55,1.15,2.7);hill(8.6,-3.1,1.65,1.3,.72,4.2);

function ribbon(points,width,color){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const vertices=[],indices=[];for(let i=0;i<=52;i++){const p=curve.getPoint(i/52),t=curve.getTangent(i/52),nx=-t.z,nz=t.x;vertices.push(p.x+nx*width/2,p.y,p.z+nz*width/2,p.x-nx*width/2,p.y,p.z-nz*width/2)}for(let i=0;i<52;i++){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const strip=mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.9,side:THREE.DoubleSide}));strip.castShadow=false;
  // Staggered joints divide the yellow surface into little paving bricks.
  const length=curve.getLength(), count=Math.max(1,Math.floor(length/.36)), joints=[];
  const at=(u,offset)=>{const p=curve.getPointAt(Math.max(0,Math.min(1,u))),v=curve.getTangentAt(Math.max(0,Math.min(1,u))),mag=Math.hypot(v.x,v.z)||1;return [p.x-v.z/mag*offset,p.y+.014,p.z+v.x/mag*offset]};
  for(let j=1;j<count;j++){const u=j/count; joints.push(...at(u,-width/2),...at(u,width/2));}
  for(let j=0;j<count;j++){const u=(j+.5)/count,side=j%2?1:-1;joints.push(...at(u,0),...at(u,side*width/2));}
  const paving=new THREE.BufferGeometry();paving.setAttribute('position',new THREE.Float32BufferAttribute(joints,3));scene.add(new THREE.LineSegments(paving,new THREE.LineBasicMaterial({color:0xd9a93d,transparent:true,opacity:.72})));
  return curve}
const plaza=cyl(1.0,1.06,.09,mats.cream,scene,0,.52,-.15,12);plaza.castShadow=false;
for(const z of ZONES.slice(0,6))ribbon([[0,.52,-.15],[z.x*.47,.55,z.z*.47],[z.x,z.y+.11,z.z]],.64,0xf4d472);
// A short straight entrance connects each front door with its existing radial path.
for(const i of [0,1,3,4]){
  const z=ZONES[i],distance=Math.hypot(z.x,z.z),dx=-z.x/distance,dz=-z.z/distance,r=i===3?2.1:2.52;
  const entry=[z.x+dx*1.15,z.y+.395,z.z+dz*1.15],edge=[z.x+dx*r,z.y+.395,z.z+dz*r],join=[z.x+dx*(r+.4),.54,z.z+dz*(r+.4)];
  ribbon([entry,edge,join],.48,0xf4d472);
}
// The sandpit is part of the park, not an extra level.
const sand=cyl(1.42,1.5,.07,mat(0xf4d99a),scene,-2.25,.51,.38,14);sand.scale.z=.82;
const sandRim=torus(1.45,.1,mats.wood,scene,-2.25,.59,.38,16);sandRim.rotation.x=-Math.PI/2;sandRim.scale.y=.82;
for(const [x,z] of [[-2.65,.28],[-2.13,.56],[-1.92,.03]]){cyl(.14,.21,.16,mats.cream,scene,x,.64,z,8);cone(.17,.19,mats.gold,scene,x,.83,z,8)}
const bucket=cyl(.14,.1,.22,mats.blue,scene,-2.8,.7,.78,10);torus(.13,.018,mats.white,scene,-2.8,.85,.78,10).rotation.x=Math.PI/2;
for(const [x,z] of [[-4.2,-.2],[1.8,.7],[4.6,.15]]){const seat=box(1.0,.12,.4,mats.wood,scene,x,.77,z);for(const dx of [-.36,.36])box(.07,.35,.07,mats.dark,scene,x+dx,.59,z)}
// Golden bridges attach to four coast points; shallow ramps account for island height.
function bridge(start,end){const mx=(start[0]+end[0])/2,mz=(start[2]+end[2])/2,arch=Math.max(start[1],end[1])+.25;const pts=[start,[(start[0]+mx)/2,arch,(start[2]+mz)/2],[mx,arch+.13,mz],[(mx+end[0])/2,arch,(mz+end[2])/2],end];const curve=ribbon(pts,.85,0xf4c84f);const dx=end[0]-start[0],dz=end[2]-start[2],d=Math.hypot(dx,dz),nx=-dz/d,nz=dx/d;for(const side of [-1,1]){const rail=[];for(let j=0;j<=20;j++){const p=curve.getPoint(j/20);rail.push([p.x+nx*.48,p.y+.32,p.z+nz*.48])}tube(rail,.034,mats.cream);for(let j=0;j<=8;j++){const p=curve.getPoint(j/8);cyl(.035,.04,.41,mats.wood,scene,p.x+nx*.48,p.y+.18,p.z+nz*.48,7)}}for(let j=1;j<15;j++){const p=curve.getPoint(j/15),v=curve.getTangent(j/15);const plank=box(.88,.03,.035,mats.cream,scene,p.x,p.y+.025,p.z);plank.rotation.y=Math.atan2(v.x,v.z)}}
const coastStarts=[[-10.8,.57,-7.75],[10.8,.57,-7.75],[-10.8,.57,7.75],[10.8,.57,7.75]];
const bridges=satelliteLand.map((p,i)=>{const start=coastStarts[i],dx=start[0]-p[0],dz=start[2]-p[1],angle=Math.atan2(dz,dx),edge=radialOutline(p[2],p[3],p[5],18);let best=edge[0],dist=Infinity;for(const e of edge){let d=Math.abs(Math.atan2(Math.sin(Math.atan2(e[1],e[0])-angle),Math.cos(Math.atan2(e[1],e[0])-angle)));if(d<dist){dist=d;best=e}}return [start,[p[0]+best[0]*.92,p[4]+.11,p[1]+best[1]*.92]]});
bridges.forEach(([a,b],i)=>{bridge(a,b);ribbon([[0,.52,-.15],[a[0]*.58,.54,a[2]*.58],a],.61,0xf4d472);const p=satelliteLand[i];ribbon([b,[(b[0]+p[0])/2,b[1],(b[2]+p[1])/2],[p[0],b[1],p[1]]],.58,0xf4d472)});
for(let i=0;i<22;i++){const x=Math.sin(i*2.3)*22,z=Math.cos(i*3.7)*17;if(Math.hypot(x,z)<10||satelliteLand.some(v=>Math.hypot(x-v[0],z-v[1])<4.6))continue;const wave=torus(.38+i%3*.11,.016,foam,scene,x,seaLevel+.04,z,18);wave.rotation.x=-Math.PI/2;wave.scale.y=.6;wave.castShadow=false}

const saved=(()=>{try{return JSON.parse(localStorage.getItem('fantasy-block-stars')||'{}')}catch{return {}}})();
const groups=[],signs=[],hitTargets=[],animated=[],fx=[];
function addZone(i){
  const z=ZONES[i],g=new THREE.Group();g.position.set(z.x,z.y,z.z);scene.add(g);groups.push(g);
  const radius=i<6?([0,1,4,5].includes(i)?2.62:2.18):2.32;
  const pad=cyl(radius,radius+.12,.27,mat(z.color),g,0,.13,0,12);pad.scale.z=.93;
  const pavement=cyl(radius-.1,radius,.12,mats.cream,g,0,.32,0,12);pavement.scale.z=.92;
  const hit=mesh(new THREE.CylinderGeometry(i<6?2.32:3.05,i<6?2.32:3.05,6.7,12),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),g,0,3.25,0);hit.castShadow=false;hit.userData.zone=i;hitTargets.push(hit);
  const signMat=new THREE.MeshBasicMaterial({map:textTexture(z.name,getStars(i),i===0?6:3),transparent:true,side:THREE.DoubleSide,depthWrite:false});
  const sign=mesh(new THREE.PlaneGeometry(3.5,1.5),signMat,g,0,5.65,0);sign.castShadow=false;sign.userData.baseY=5.65;signs.push(sign);return g;
}
function roof(w,d,m,g,baseY,x=0,z=0){
  // Place each rectangular roof directly on the top of its eave, without intersecting the trim.
  const h=w*.43, a=w/2, b=d/2;
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute([
    -a,0,-b, 0,h,0, a,0,-b,
    a,0,-b, 0,h,0, a,0,b,
    a,0,b, 0,h,0, -a,0,b,
    -a,0,b, 0,h,0, -a,0,-b
  ],3));
  geo.computeVertexNormals();
  const roofMesh=mesh(geo,m,g,x,baseY,z);
  // Rounded overlapping clay tiles give the roof a proper toy-like silhouette.
  const tileGeometry=new THREE.SphereGeometry(1,8,6);
  const tileMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.84,flatShading:true});
  const rows=5,columns=7, tiles=new THREE.InstancedMesh(tileGeometry,tileMaterial,4*rows*columns);
  const roofFaces=[(t,q)=>[q*a*(1-t),h*t,-b*(1-t)],(t,q)=>[a*(1-t),h*t,q*b*(1-t)],(t,q)=>[q*a*(1-t),h*t,b*(1-t)],(t,q)=>[-a*(1-t),h*t,q*b*(1-t)]];
  let n=0;const dummy=new THREE.Object3D();
  for(const point of roofFaces){
    const edge=new THREE.Vector3(...point(0,1)).sub(new THREE.Vector3(...point(0,-1))).normalize();
    const uphill=new THREE.Vector3(...point(1,0)).sub(new THREE.Vector3(...point(0,0))).normalize();
    const normal=new THREE.Vector3().crossVectors(uphill,edge).normalize();if(normal.y<0)normal.negate();
    const down=new THREE.Vector3().crossVectors(edge,normal).normalize();
    const basis=new THREE.Matrix4().makeBasis(edge,normal,down), faceWidth=new THREE.Vector3(...point(0,1)).distanceTo(new THREE.Vector3(...point(0,-1)));
    const slopeLength=new THREE.Vector3(...point(1,0)).distanceTo(new THREE.Vector3(...point(0,0)));
    for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
      const t=(row+.43)/rows,q=-1+(col+.5+(row%2?.22:-.22))*2/columns;
      const pos=new THREE.Vector3(...point(t,q)).addScaledVector(normal,.04);
      dummy.position.set(x+pos.x,baseY+pos.y,z+pos.z);dummy.quaternion.setFromRotationMatrix(basis);
      dummy.scale.set(faceWidth*(1-t)/columns*.53,.055,slopeLength/rows*.63);dummy.updateMatrix();tiles.setMatrixAt(n,dummy.matrix);
      const tint=m.color.clone().multiplyScalar(.94+(row+col)%4*.035);tiles.setColorAt(n,tint);n++;
    }
  }
  tiles.instanceMatrix.needsUpdate=true;tiles.castShadow=true;tiles.receiveShadow=true;g.add(tiles);
  // A soft, upturned eave along each side frames the tiled roof.
  const rimMat=mat(m.color.clone().multiplyScalar(.83));
  for(const side of [-1,1]){
    tube([[-a,baseY+.16,side*b],[-a*.55,baseY+.03,side*b],[0,baseY+.015,side*b],[a*.55,baseY+.03,side*b],[a,baseY+.16,side*b]],.065,rimMat,g).position.set(x,0,z);
    tube([[side*a,baseY+.16,-b],[side*a,baseY+.03,-b*.55],[side*a,baseY+.015,0],[side*a,baseY+.03,b*.55],[side*a,baseY+.16,b]],.065,rimMat,g).position.set(x,0,z);
  }
  return roofMesh;
}
function windowBox(g,x,y,z,color=mats.blue){box(.45,.55,.08,mats.white,g,x,y,z);box(.33,.42,.1,color,g,x,y,z+.06);box(.05,.52,.12,mats.white,g,x,y,z+.12);box(.5,.06,.16,mats.wood,g,x,y-.31,z+.05)}
function door(g,x,y,z){box(.76,1.2,.10,mats.cream,g,x,y,z-.025);box(.67,1.12,.09,mats.wood,g,x,y,z);box(.51,.93,.11,mats.mint,g,x,y-.06,z+.04);box(.38,.27,.035,mats.blue,g,x,y+.22,z+.11);box(.04,.27,.04,mats.white,g,x,y+.22,z+.14);box(.38,.04,.04,mats.white,g,x,y+.22,z+.14);box(.5,.07,.05,mats.wood,g,x,y-.28,z+.13);sphere(.045,mats.gold,g,x+.18,y-.05,z+.15,8)}
function awning(g,w,y,z,colors){box(w,.12,.65,mats.white,g,0,y,z);for(let k=0;k<7;k++){const x=(k-3)*w/7,c=colors[k%colors.length];box(w/7,.07,.69,c,g,x,y+.08,z);const valance=sphere(w/14,c,g,x,y-.03,z+.34,10);valance.scale.set(1,.62,.32)}}
function houseDetails(g,front,top,roofMat){
  // Window boxes, blossoms, entrance steps, lamps and a tiny dormer.
  for(const x of [-.9,.9]){
    box(.62,.18,.27,mats.wood,g,x,1.18,front+.18);box(.69,.07,.3,mats.cream,g,x,1.28,front+.18);
    for(let k=0;k<5;k++){const dx=(k-2)*.105;sphere(.10,mats.grass2,g,x+dx,1.35,front+.18,7);sphere(.06,[mats.pink,mats.gold,mats.white][k%3],g,x+dx,1.44+(k%2)*.03,front+.19,7)}
  }
  box(.92,.12,.32,mats.cream,g,0,.49,front+.27);box(1.08,.1,.33,mats.white,g,0,.39,front+.48);
  for(const x of [-.49,.49]){box(.1,.15,.12,mats.wood,g,x,1.62,front+.15);sphere(.095,mats.gold,g,x,1.52,front+.2,8)}
  for(const side of [-1,1]){
    const facade=new THREE.Group();facade.position.set(side*1.39,0,-.12);facade.rotation.y=side*Math.PI/2;g.add(facade);
    for(const pos of [-.48,.48]){windowBox(facade,pos,1.56,.04,mats.blue);box(.52,.15,.23,mats.wood,facade,pos,1.2,.14);for(let k=0;k<3;k++)sphere(.075,[mats.grass2,mats.pink,mats.gold][k],facade,pos+(k-1)*.13,1.32,.17,7)}
    box(.07,1.75,.1,mats.cream,facade,-.9,1.48,0);box(.07,1.75,.1,mats.cream,facade,.9,1.48,0);
  }
  const rear=new THREE.Group();rear.position.set(0,0,-1.19);rear.rotation.y=Math.PI;g.add(rear);
  for(const pos of [-.72,.72]){windowBox(rear,pos,1.57,.04,mats.blue);box(.52,.16,.22,mats.wood,rear,pos,1.2,.15);for(let k=0;k<3;k++)sphere(.075,[mats.grass2,mats.white,mats.pink][k],rear,pos+(k-1)*.13,1.33,.17,7)}
  box(2.65,.08,.1,mats.cream,rear,0,1.05,.04);
  const dormer=new THREE.Group();dormer.position.set(0,top+.46,.65);g.add(dormer);
  box(.48,.42,.23,mats.cream,dormer,0,.17,0);box(.3,.28,.04,mats.blue,dormer,0,.19,.13);box(.035,.3,.05,mats.white,dormer,0,.19,.16);box(.34,.04,.05,mats.white,dormer,0,.18,.16);
  const dormerRoof=cone(.41,.25,roofMat,dormer,0,.46,0,4);dormerRoof.rotation.y=Math.PI/4;dormerRoof.scale.z=.72;
}
function drinkHouse(g){
  houseDetails(g,1.01,2.612,mats.pink);
  box(2.75,1.9,2.05,mats.cream,g,0,1.43,-.1);box(2.85,.22,2.16,mats.wood,g,0,2.5,-.1);roof(3.15,2.25,mats.pink,g,2.612,0,-.1);
  box(2.88,.14,.2,mats.gold,g,0,2.55,.99);awning(g,2.7,2.23,1.31,[mats.red,mats.pink,mats.gold,mats.grass,mats.mint,mats.blue,mats.pink]);
  // Rainbow arch and a cup over the front awning echo the illustrated level.
  for(let i=0;i<4;i++){const arc=mesh(new THREE.TorusGeometry(.58-i*.09,.046,6,24,Math.PI),[mats.red,mats.gold,mats.mint,mats.blue][i],g,0,2.72,1.22);arc.castShadow=false}
  box(.27,.36,.09,mats.white,g,0,2.94,1.28);box(.21,.24,.1,mats.gold,g,0,2.92,1.34);const straw=box(.04,.23,.04,mats.blue,g,.07,3.17,1.36);straw.rotation.z=-.28;
  for(const x of [-1.17,1.17])box(.16,2.18,.17,mats.wood,g,x,1.48,1.06);
  box(2.46,.16,.45,mats.wood,g,0,.95,1.29);box(2.32,.42,.26,mats.grass2,g,0,.7,1.14);
  for(let i=0;i<6;i++){const c=[mats.blue,mats.gold,mats.white,mats.cream,mats.pink,mats.red][i],x=-.94+i*.37;cyl(.11,.09,.24,c,g,x,1.15,1.34,8);box(.22,.035,.22,mats.white,g,x,1.01,1.34)}
  door(g,0,.98,1.01);windowBox(g,-.9,1.57,1.01,mats.blue);windowBox(g,.9,1.57,1.01,mats.pink);
  for(const x of [-1.12,1.12]){box(.17,1.82,.13,mats.white,g,x,1.43,1.02);sphere(.14,mats.gold,g,x,2.45,1.08)}
  box(.38,.85,.36,mats.cream,g,.87,3.22,-.52);box(.5,.12,.5,mats.gold,g,.87,3.68,-.52);
  cyl(.32,.26,.55,mats.white,g,-.5,3.54,.08,12);torus(.16,.05,mats.white,g,-.08,3.56,.08,12);cyl(.35,.35,.09,mats.red,g,-.5,3.83,.08);box(.035,.45,.035,mats.gold,g,-.4,4.06,.08).rotation.z=.28;
  for(const x of [-1.34,1.34]){cyl(.3,.36,.35,mats.wood,g,x,.64,1.33,10);sphere(.32,mats.grass2,g,x,.96,1.33,9)}
  const counter=box(.88,.4,.5,mats.white,g,-1.17,.68,-.1);for(let i=0;i<3;i++){cyl(.1,.08,.25,[mats.red,mats.gold,mats.blue][i],g,-1.45+i*.26,1.0,.05,8);box(.015,.25,.015,mats.white,g,-1.41+i*.26,1.19,.05)}
}
function iceCreamHouse(g){
  houseDetails(g,1.01,2.632,mats.blue);
  box(2.7,1.95,2.05,mats.mint,g,0,1.45,-.08);box(2.78,.22,2.14,mats.pink,g,0,2.52,-.08);roof(3.1,2.26,mats.blue,g,2.632,0,-.08);
  awning(g,2.62,2.22,1.28,[mats.gold,mats.white]);door(g,0,1.01,1.01);windowBox(g,-.91,1.55,1.02,mats.pink);windowBox(g,.91,1.55,1.02,mats.blue);
  box(2.75,.12,.12,mats.gold,g,0,2.56,1.03);for(let i=0;i<7;i++)sphere(.075,[mats.gold,mats.white,mats.pink][i%3],g,-1.14+i*.38,2.61,1.12,8);
  for(let i=0;i<4;i++){const x=-.95+i*.63, y=3.68-Math.abs(x)*.35;const cup=cyl(.23,.18,.22,[mats.gold,mats.red,mats.gold,mats.pink][i],g,x,y,-.1,10);sphere(.2,mats.white,g,x,y+.18,-.1,10);const scoop=cone(.22,.62,[mats.gold,mats.pink,mats.mint,mats.red][i],g,x,y+.56,-.1,10);for(let j=0;j<3;j++)sphere(.04,mats.white,g,x+((j%2)*2-1)*.08,y+.38+j*.13,.08,6)}
  for(const x of [-1.18,1.18]){cyl(.28,.34,.28,mats.wood,g,x,.61,1.39,10);sphere(.28,mats.mint,g,x,.86,1.39,9)}
  // A miniature sweets display and candy-striped side canopy.
  box(.72,.45,.32,mats.wood,g,-.87,.76,1.29);box(.76,.08,.38,mats.white,g,-.87,1.02,1.33);
  for(let i=0;i<3;i++){const x=-1.1+i*.23;cone(.09,.24,mats.gold,g,x,1.16,1.31,7).rotation.z=Math.PI;sphere(.11,[mats.pink,mats.white,mats.mint][i],g,x,1.31,1.31,8)}
  const sideAwning=new THREE.Group();sideAwning.position.set(1.4,0,-.18);sideAwning.rotation.y=Math.PI/2;g.add(sideAwning);awning(sideAwning,1.25,2.05,.25,[mats.pink,mats.white]);
  for(const x of [-1.27,1.27]){box(.12,1.3,.12,mats.cream,g,x,1.18,1.02);sphere(.09,mats.gold,g,x,1.9,1.08,8)}
  cyl(.48,.48,.07,mats.white,g,1.55,.64,-.36,10);cyl(.05,.05,.45,mats.wood,g,1.55,.42,-.36,7);for(const x of [1.18,1.9]){cyl(.19,.19,.36,mats.pink,g,x,.56,-.42,10);box(.3,.1,.27,mats.white,g,x,.77,-.42)}
}
function carousel(g){
  cyl(1.84,1.92,.25,mats.pink,g,0,.5,0,18);cyl(1.72,1.8,.12,mats.gold,g,0,.67,0,18);
  const fence=torus(2.02,.055,mats.white,g,0,.73,0,24);fence.rotation.x=Math.PI/2;
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,x=Math.cos(a)*2.02,z=Math.sin(a)*2.02;cyl(.035,.035,.54,mats.gold,g,x,.72,z,7);sphere(.07,mats.gold,g,x,1.02,z,7)}
  const spinner=new THREE.Group();g.add(spinner);spinner.position.y=.68;spinner.userData.spinAxis='y';cyl(1.51,1.55,.18,mats.cream,spinner,0,.14,0,18);cyl(.16,.2,2.48,mats.gold,spinner,0,1.44,0,12);
  const horses=[];
  for(let i=0;i<6;i++){
    const a=i/6*Math.PI*2,x=Math.cos(a)*1.1,z=Math.sin(a)*1.1;cyl(.035,.035,2.08,mats.gold,spinner,x,1.36,z,8);
    const horse=new THREE.Group();horse.position.set(x,.9,z);horse.rotation.y=-a;spinner.add(horse);horses.push(horse);
    box(.53,.25,.24,mats.white,horse,0,.18,0);const neck=box(.15,.36,.18,mats.white,horse,.24,.39,0);neck.rotation.z=-.28;box(.29,.22,.21,mats.white,horse,.32,.58,0);box(.12,.1,.22,mats.cream,horse,.47,.52,0);
    for(const lx of [-.18,.18])for(const lz of [-.07,.07]){const leg=box(.065,.31,.065,mats.white,horse,lx,-.07,lz);leg.rotation.z=lx<0?.18:-.18;box(.08,.06,.08,mats.wood,horse,lx,-.23,lz)}
    box(.29,.12,.29,[mats.pink,mats.blue,mats.mint,mats.gold][i%4],horse,-.02,.34,0);box(.07,.3,.08,mats.gold,horse,.18,.45,-.11);cone(.07,.16,mats.pink,horse,.25,.76,-.06,5);cone(.07,.16,mats.pink,horse,.37,.76,.06,5);sphere(.026,mats.dark,horse,.38,.62,.115,7);const tail=cone(.09,.35,mats.gold,horse,-.33,.22,0,6);tail.rotation.z=-.8;
  }
  for(let i=0;i<12;i++){const a=i*Math.PI*2/12,b=(i+1)*Math.PI*2/12;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([0,3.34,0,Math.cos(a)*1.68,2.2,Math.sin(a)*1.68,Math.cos(b)*1.68,2.2,Math.sin(b)*1.68],3));geo.computeVertexNormals();const panel=mesh(geo,[mats.pink,mats.white,mats.mint][i%3],spinner);panel.material.side=THREE.DoubleSide}
  cyl(1.7,1.7,.14,mats.gold,spinner,0,2.2,0,18);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;sphere(.085,i%2?mats.white:mats.pink,spinner,Math.cos(a)*1.63,2.18,Math.sin(a)*1.63,8)}sphere(.22,mats.gold,spinner,0,3.37,0);
  box(.73,.82,.7,mats.blue,g,-1.95,.91,1.13);roof(.84,.8,mats.gold,g,1.322,-1.95,1.13);box(.34,.43,.08,mats.white,g,-1.95,.92,1.5);animated.push({obj:spinner,speed:.013,zone:2});fx.push(t=>horses.forEach((h,i)=>h.position.y=.9+Math.sin(t*2+i*Math.PI/3)*.14));
}
function coaster(g){
  box(2.5,1.28,1.55,mats.blue,g,0,1.04,-.48);roof(2.8,1.75,mats.red,g,1.682,0,-.48);door(g,0,.94,.33);
  for(const x of [-.9,.9])windowBox(g,x,1.2,.32,mats.gold);
  const trackPoints=[];for(let i=0;i<24;i++){const a=i*Math.PI*2/24;trackPoints.push(new THREE.Vector3(Math.cos(a)*2.25,1.05+.48*(.5+.5*Math.cos(a*2)), -3.3+Math.sin(a)*.8))}const track=new THREE.CatmullRomCurve3(trackPoints,true,'centripetal');
  for(const side of [-.3,.3]){const rail=[];for(let i=0;i<=96;i++){const p=track.getPointAt(i/96),v=track.getTangentAt(i/96),d=Math.hypot(v.x,v.z),nx=-v.z/d,nz=v.x/d;rail.push([p.x+nx*side,p.y,p.z+nz*side])}tube(rail,.055,mats.gold,g)}
  for(let i=0;i<28;i++){const p=track.getPointAt(i/28),v=track.getTangentAt(i/28),d=Math.hypot(v.x,v.z),nx=-v.z/d,nz=v.x/d;const sleeper=box(.12,.08,.74,mats.red,g,p.x,p.y-.07,p.z);sleeper.rotation.y=-Math.atan2(v.z,v.x);if(i%4===0){const h=Math.max(.1,p.y-.48);for(const side of [-.3,.3])box(.06,h,.06,mats.white,g,p.x+nx*side,.45+h/2,p.z+nz*side)}}
  const car=new THREE.Group();g.add(car);box(.82,.29,.55,mats.pink,car,0,.3,0);box(.66,.11,.44,mats.white,car,0,.52,0);for(const x of [-.27,.27])for(const z of [-.3,.3]){const wheel=cyl(.13,.13,.08,mats.dark,car,x,0,z,10);wheel.rotation.x=Math.PI/2}g.userData.coasterCar=car;g.userData.coasterTrack=track;
  for(const x of [-1.85,1.85]){cyl(.045,.045,1.42,mats.white,g,x,1.25,.64,8);const flag=box(.48,.3,.04,x<0?mats.pink:mats.gold,g,x+.24,1.82,.64);flag.rotation.y=.13}
}
function giftHouse(g){
  houseDetails(g,.9,2.582,mats.red);
  box(2.72,1.86,2.05,mats.cream,g,0,1.43,-.16);box(2.8,.18,2.12,mats.white,g,0,2.49,-.16);roof(3.1,2.3,mats.red,g,2.582,0,-.16);
  box(2.2,.14,.79,mats.wood,g,0,.47,1.27);door(g,0,1.02,.9);windowBox(g,-.96,1.56,.9,mats.pink);windowBox(g,.96,1.56,.9,mats.blue);
  for(const x of [-1.21,1.21]){box(.13,1.6,.12,mats.gold,g,x,1.4,.93);sphere(.13,mats.gold,g,x,2.32,.96)}
  awning(g,2.66,2.18,1.21,[mats.red,mats.white,mats.blue]);
  const colors=[mats.red,mats.blue,mats.pink,mats.gold,mats.mint,mats.blue];g.userData.balloons=[];for(let i=0;i<6;i++){const x=-.63+(i%3)*.53,y=3.88+Math.floor(i/3)*.53+(i%2)*.12,z=-.34+(i%2)*.27;const b=sphere(.4,colors[i],g,x,y,z);b.scale.y=1.22;g.userData.balloons.push({mesh:b,y});tube([[x,y-.39,z],[x*.3,3.16,z*.3]],.014,mats.white,g)}
  for(const [x,z,m] of [[-1.31,1.38,mats.blue],[1.22,1.35,mats.pink]]){box(.62,.55,.62,m,g,x,.72,z);box(.11,.58,.65,mats.gold,g,x,.73,z);box(.66,.1,.66,mats.gold,g,x,1.04,z)}
  box(.42,.37,.39,mats.mint,g,1.89,.58,.4);box(.09,.4,.42,mats.pink,g,1.89,.59,.4);const lid=box(.72,.11,.7,mats.gold,g,1.22,1.08,1.35);g.userData.giftLid=lid;
}
function ferrisWheel(g){
  const wheel=new THREE.Group();g.add(wheel);wheel.position.set(.42,3.04,-.49);
  torus(2.03,.12,mats.blue,wheel,0,0,0,28);torus(1.69,.055,mats.white,wheel,0,0,0,28);
  const cabins=[];for(let i=0;i<10;i++){const a=i/10*Math.PI*2,x=Math.cos(a)*2.03,y=Math.sin(a)*2.03;const spoke=box(2.02,.045,.045,mats.white,wheel,x/2,y/2,0);spoke.rotation.z=a;const cabin=new THREE.Group();cabin.position.set(x,y,.13);wheel.add(cabin);box(.45,.4,.42,[mats.pink,mats.gold,mats.mint,mats.red,mats.blue][i%5],cabin,0,-.28,0);box(.48,.07,.44,mats.white,cabin,0,-.03,0);cabins.push(cabin)}
  cyl(.22,.22,.37,mats.gold,wheel,0,0,.13);for(const s of [-1,1]){const support=box(.13,3.4,.12,mats.white,g,.42+s*.69,1.68,-.5);support.rotation.z=s*.31}
  box(1.42,1.23,1.02,mats.cream,g,-1.46,1.03,1.05);roof(1.62,1.15,mats.pink,g,1.647,-1.46,1.05);door(g,-1.46,.84,1.58);windowBox(g,-1.98,1.35,1.57,mats.blue);
  box(1.13,.14,.58,mats.wood,g,.9,.49,1.45);for(const x of [.42,1.38])cyl(.12,.12,.52,mats.white,g,x,.24,1.45,8);for(const x of [-2.09,-.84]){cyl(.035,.035,1.28,mats.gold,g,x,1.18,1.76);sphere(.12,mats.white,g,x,1.88,1.76)}animated.push({obj:wheel,speed:.009,zone:5,cabins});
}
function pirateShip(g){
  const deck=cyl(2.12,2.16,.23,mats.blue,g,0,.47,0,14);deck.scale.z=.88;
  for(const s of [-1,1]){const leg=box(.13,2.7,.13,mats.white,g,s*.76,1.75,0);leg.rotation.z=s*.3}
  cyl(.16,.16,.35,mats.gold,g,0,2.85,0,12);
  const swing=new THREE.Group();swing.position.set(0,2.75,0);g.add(swing);
  for(const x of [-1.08,1.08])cyl(.045,.045,1.65,mats.wood,swing,x,-.87,0,8);
  const hull=sphere(1.42,mats.wood,swing,0,-1.75,0,12);hull.scale.set(1,.43,.42);
  box(2.6,.2,.85,mats.red,swing,0,-1.67,0);for(const x of [-1.18,1.18]){cone(.35,.57,mats.wood,swing,x,-1.57,0,5).rotation.z=x<0?-Math.PI/2:Math.PI/2}
  cyl(.055,.055,1.18,mats.white,swing,0,-.97,0,8);const flag=box(.66,.44,.06,mats.pink,swing,.35,-.47,0);flag.rotation.y=.1;
  for(const x of [-.65,.65])sphere(.13,mats.gold,swing,x,-1.5,.42,8);
  fx.push((t)=>{swing.rotation.z=Math.sin(t*(active===6?1.35:.92))*(active===6?.58:.39)});
}
function skyChairs(g){
  cyl(2.12,2.18,.22,mats.gold,g,0,.45,0,14);cyl(.22,.26,2.55,mats.white,g,0,1.65,0,12);
  const spinner=new THREE.Group();spinner.position.set(0,2.9,0);g.add(spinner);cone(1.55,.72,mats.pink,spinner,0,.27,0,14);cyl(1.62,1.62,.12,mats.gold,spinner,0,-.12,0,14);sphere(.18,mats.white,spinner,0,.73,0,9);
  const chairs=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2,pivot=new THREE.Group();pivot.rotation.y=a;pivot.position.set(Math.cos(a)*1.42,-.1,Math.sin(a)*1.42);spinner.add(pivot);cyl(.025,.025,.96,mats.white,pivot,0,-.52,0,7);box(.36,.13,.34,[mats.blue,mats.mint,mats.red,mats.gold][i%4],pivot,0,-1.07,0);box(.36,.27,.07,mats.white,pivot,0,-.89,-.16);chairs.push(pivot)}
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;sphere(.07,mats.white,spinner,Math.cos(a)*1.55,-.06,Math.sin(a)*1.55,7)}
  fx.push((t,delta)=>{spinner.rotation.y+=delta*(active===7?1.45:.82);chairs.forEach((c,i)=>{c.rotation.z=Math.sin(t*1.2+i*.45)*(active===7?.3:.18)})});
}
function bumperCars(g){
  const arena=cyl(2.15,2.2,.22,mats.blue,g,0,.48,0,16);arena.scale.z=.92;const ring=torus(2.18,.08,mats.gold,g,0,.62,0,22);ring.rotation.x=-Math.PI/2;ring.scale.y=.92;
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;cyl(.035,.04,.48,mats.white,g,Math.cos(a)*2.17,.86,Math.sin(a)*1.97,7)}
  const cars=[];for(let i=0;i<4;i++){const car=new THREE.Group();g.add(car);box(.65,.25,.47,[mats.red,mats.gold,mats.mint,mats.pink][i],car,0,.72,0);box(.45,.21,.3,mats.white,car,0,.95,-.05);torus(.34,.06,mats.dark,car,0,.64,0,12).rotation.x=Math.PI/2;cars.push(car)}
  const sparks=[];for(let i=0;i<5;i++){const star=mesh(new THREE.OctahedronGeometry(.1,0),mats.gold,g,0,1.25,0);sparks.push(star)}
  fx.push((t)=>{cars.forEach((car,i)=>{const a=t*(active===8?.95:.42)+i*Math.PI/2;car.position.set(Math.cos(a)*1.24,0,Math.sin(a)*.92);car.rotation.y=-a+Math.PI/2});sparks.forEach((s,i)=>{const blink=Math.max(0,Math.sin(t*2.2+i*1.3));s.visible=blink>.78;s.position.set(Math.sin(i*2.4)*.9,1.1+blink*.3,Math.cos(i*1.9)*.6)})});
}
function cloudSlide(g){
  const base=cyl(2.1,2.16,.2,mats.mint,g,0,.45,0,14);base.scale.z=.9;
  for(const [x,y,z,r] of [[-.87,2.1,-.28,.73],[-.18,2.35,-.18,.85],[.48,2.07,-.3,.7],[.98,1.78,-.25,.48]]){const puff=sphere(r,mats.white,g,x,y,z,10);puff.scale.y=.72}
  box(.64,1.54,.6,mats.blue,g,-1.1,1.23,.55);for(let k=0;k<4;k++)box(.65,.09,.16,mats.gold,g,-1.1,.67+k*.3,.92);
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.7,2.3,.6),new THREE.Vector3(-.3,1.86,1.15),new THREE.Vector3(.55,1.35,1.23),new THREE.Vector3(1.22,.77,1.07)]);
  tube(curve.getPoints(30).map(p=>[p.x,p.y,p.z]),.25,mats.gold,g);for(const dx of [-.22,.22])tube(curve.getPoints(22).map(p=>[p.x+dx,p.y+.13,p.z]),.045,mats.white,g);
  const star=mesh(new THREE.OctahedronGeometry(.24,0),mats.pink,g,-.7,2.5,.6);const trail=[];for(let k=0;k<4;k++)trail.push(sphere(.07,mats.white,g,0,0,0,7));
  fx.push((t)=>{const speed=active===9?.32:.13,u=(t*speed)%1,p=curve.getPoint(u);star.position.copy(p);star.position.y+=.29;star.rotation.y=t*2;trail.forEach((dot,k)=>{const q=curve.getPoint((u-k*.065+1)%1);dot.position.set(q.x,q.y+.28,q.z);dot.scale.setScalar(.85-k*.16)})});
}
const builders=[drinkHouse,iceCreamHouse,carousel,coaster,giftHouse,ferrisWheel,pirateShip,skyChairs,bumperCars,cloudSlide];
ZONES.forEach((_,i)=>builders[i](addZone(i)));
// Turn the building fronts toward the central paths; their doors now face the plaza.
for(const i of [0,1,3,4])groups[i].rotation.y=Math.atan2(-ZONES[i].x,-ZONES[i].z);
// Distinct gentle motion on every original main-island attraction.
const drinkCup=new THREE.Group();groups[0].add(drinkCup);drinkCup.position.set(1.45,.47,1.28);cyl(.3,.22,.5,mats.white,drinkCup,0,.25,0,12);const liquid=[mats.red,mats.gold,mats.blue].map((m,i)=>cyl(.215,.21,.12,m,drinkCup,0,.08+i*.12,0,12));for(let i=0;i<4;i++)sphere(.045,mats.white,drinkCup,(i-1.5)*.1,.63+i*.11,0,7);fx.push(t=>liquid.forEach((p,i)=>p.scale.y=.35+.65*(.5+.5*Math.sin(t*1.6-i*.8))));
const scoops=new THREE.Group();groups[1].add(scoops);scoops.position.set(1.55,.45,1.27);cone(.24,.53,mats.wood,scoops,0,.43,0,9).rotation.z=Math.PI;sphere(.25,mats.pink,scoops,0,.74,0);sphere(.21,mats.white,scoops,0,1.03,0);const sprinkles=[];for(let i=0;i<9;i++)sprinkles.push(sphere(.035,[mats.gold,mats.blue,mats.red][i%3],scoops,Math.sin(i*2)*.23,.8+(i%4)*.12,Math.cos(i*2)*.12,6));fx.push(t=>{scoops.position.y=.45+Math.sin(t*1.4)*.1;sprinkles.forEach((p,i)=>p.rotation.y=t+i)});
fx.push(t=>{const {coasterCar:car,coasterTrack:track}=groups[3].userData;const u=(t*(active===3?.12:.065))%1,p=track.getPointAt(u),v=track.getTangentAt(u);car.position.copy(p);car.position.y+=.13;car.rotation.order='YXZ';car.rotation.y=-Math.atan2(v.z,v.x);car.rotation.z=Math.atan2(v.y,Math.hypot(v.x,v.z))});
fx.push(t=>{groups[4].userData.balloons.forEach((b,i)=>{b.mesh.position.y=b.y+Math.sin(t*1.25+i*.6)*.12;b.mesh.position.x+=Math.sin(t*.6+i)*.0005});const lid=groups[4].userData.giftLid;lid.rotation.z=(.5+.5*Math.sin(t*(active===4?2.2:.9)))*.23});

function littleTree(parent,x,z,s=1){const t=new THREE.Group();t.position.set(x,.13,z);const height=0.82+0.52*(.5+.5*Math.sin(x*3.19+z*2.31));t.scale.set(s,s*height,s);parent.add(t);cyl(.09,.13,.64,mats.wood,t,0,.3,0,7);for(let k=0;k<3;k++)sphere(.39,[mats.grass2,mats.mint,mats.grass][k],t,(k-1)*.25,.95+(k%2)*.1,0,8)}
function flower(parent,x,z,color,s=1){const f=new THREE.Group();f.position.set(x,.05,z);f.scale.setScalar(s);parent.add(f);cyl(.018,.02,.32,mats.grass2,f,0,.17,0,6);for(let k=0;k<5;k++){const a=k*Math.PI*2/5;sphere(.085,color,f,Math.cos(a)*.12,.36,Math.sin(a)*.12,7)}sphere(.08,mats.gold,f,0,.37,0,7)}
function shrub(parent,x,z,s=1){for(const [dx,dz,r] of [[-.18,0,.27],[.17,-.07,.31],[.03,.22,.25]])sphere(r,mats.grass2,parent,x+dx*s,.28*s,z+dz*s,8)}
function mushroom(parent,x,z,m){cyl(.1,.12,.32,mats.white,parent,x,.21,z,8);const cap=sphere(.27,m,parent,x,.42,z,9);cap.scale.y=.55;for(const dx of [-.12,.12])sphere(.035,mats.white,parent,x+dx,.51,z,7)}
// Park planting is concentrated along the main island's irregular shoreline and hills.
const mainGarden=new THREE.Group();mainGarden.position.y=.45;scene.add(mainGarden);
const mainTrees=[[-11.7,-1.2,.74],[-10.5,3.8,.72],[-9.2,-2.7,.82],[-9.7,.1,.75],[-8.8,5.2,.85],[-5.3,6.7,.7],[-3.7,6.5,.75],[2.65,6.4,.68],[5.2,5.8,.76],[8.8,4.6,.72],[9.4,.3,.78],[11.1,-1.3,.72],[8.3,-3.5,.68],[7.1,-7.6,.7],[5.8,-6.3,.72],[.45,-7.0,.66],[-2.6,-8.1,.7],[-4.9,-6.1,.67],[-8.1,-6.25,.7]];
mainTrees.forEach(([x,z,s])=>littleTree(mainGarden,x,z,s));
for(let i=0;i<45;i++){const a=i*2.399,r=6.25+(i%5)*.75,x=Math.cos(a)*r*1.32,z=Math.sin(a)*r*.8;if(ZONES.slice(0,6).some(q=>Math.hypot(x-q.x,z-q.z)<2.8))continue;shrub(mainGarden,x,z,.58+(i%3)*.13)}
for(let i=0;i<84;i++){const a=i*2.75,r=2.2+(i%8)*.85,x=Math.cos(a)*r*1.18,z=Math.sin(a)*r*.8;if(x*x/125+z*z/70>.77||ZONES.slice(0,6).some(q=>Math.hypot(x-q.x,z-q.z)<2.45)||Math.hypot(x+2.25,z-.38)<1.85)continue;flower(mainGarden,x,z,[mats.pink,mats.white,mats.gold,mats.blue][i%4],.55+(i%3)*.12)}
for(const [x,z,m] of [[-8.7,1.8,mats.red],[-3.7,2.8,mats.pink],[4.6,-1.6,mats.blue],[8.2,5.5,mats.red]])mushroom(mainGarden,x,z,m);
for(const [x,z] of [[-8.7,5.7],[3.9,6.2]]){const crown=new THREE.Group();crown.position.set(x,.95,z);scene.add(crown);littleTree(crown,-.55,0,.75);littleTree(crown,.5,.25,.6);shrub(crown,.1,-.42,.65)}
// Each satellite attraction has its own colorful ticket kiosk.
function ticketKiosk(parent,x,z,color){
  const footing=cyl(.72,.76,.30,mats.cream,parent,x,.17,z,12);footing.receiveShadow=true;
  const kiosk=new THREE.Group();kiosk.position.set(x,.32,z);parent.add(kiosk);
  cyl(.47,.5,.10,mats.cream,kiosk,0,.05,0,12);cyl(.41,.44,.65,color,kiosk,0,.42,0,12);
  cyl(.45,.45,.09,mats.wood,kiosk,0,.78,0,12);cyl(.40,.40,.62,mats.cream,kiosk,0,1.12,0,12);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;cyl(.026,.026,.65,mats.wood,kiosk,Math.cos(a)*.4,1.12,Math.sin(a)*.4,6)}
  for(let i=0;i<4;i++){const a=i*Math.PI/2;const pane=box(.35,.38,.035,mats.blue,kiosk,Math.sin(a)*.405,1.13,Math.cos(a)*.405);pane.rotation.y=a}
  cyl(.48,.48,.08,mats.gold,kiosk,0,1.46,0,12);
  for(let i=0;i<10;i++){const a=i*Math.PI/5;const ornament=sphere(.10,i%2?mats.cream:color,kiosk,Math.cos(a)*.43,1.49,Math.sin(a)*.43,8);ornament.scale.y=.65}
  const dome=mesh(new THREE.SphereGeometry(.49,12,6,0,Math.PI*2,0,Math.PI/2),color,kiosk,0,1.50,0);dome.scale.y=.8;
  sphere(.095,mats.gold,kiosk,0,1.92,0,8);
}
for(let i=6;i<10;i++)ticketKiosk(groups[i],2.15,1.35,[mats.red,mats.blue,mats.pink,mats.mint][i-6]);
for(let i=6;i<10;i++){const z=ZONES[i];ribbon([[z.x+2.15,z.y+.34,z.z+1.35],[z.x+1.7,z.y+.39,z.z+1.1],[z.x+.8,z.y+.4,z.z+.55],[z.x,z.y+.4,z.z]],.42,0xf4d472)}
// Each small island has a planted rim and a clear entrance to its attraction.
for(let i=6;i<10;i++){const g=groups[i];for(const [x,z,s] of [[-2.35,-1.4,.67],[2.28,-1.3,.62],[-2.48,.62,.55]])littleTree(g,x,z,s);shrub(g,2.4,.86,.8);mushroom(g,-2.1,1.5,i%2?mats.pink:mats.red);for(let k=0;k<13;k++){const a=k*2.399+i*.4,x=Math.cos(a)*2.72,z=Math.sin(a)*2.28;if(Math.abs(x)<.8&&z>1.6)continue;flower(g,x,z,[mats.pink,mats.white,mats.gold,mats.blue][(i+k)%4],.55)}}
function cloud(x,y,z,s){const c=new THREE.Group();c.position.set(x,y,z);c.scale.setScalar(s);scene.add(c);const cm=mat(0xffffff);for(const [dx,dy,r] of [[-.65,0,.54],[0,.15,.7],[.72,0,.52]]){const p=sphere(r,cm,c,dx,dy,0,10);p.castShadow=false}return c}
const clouds=[[-23,10,-15,1.15],[-8,11,13,.85],[6,9,-17,1.05],[20,12,10,1.24],[-15,8,4,.7]].map(p=>cloud(...p));
// Sea visitors appear only in open water, away from the bridges and island edges.
function uprightFin(parent,points,material,x,y,z,depth=.1){const shape=new THREE.Shape();points.forEach((p,i)=>i?shape.lineTo(p[0],p[1]):shape.moveTo(p[0],p[1]));shape.closePath();return mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),material,parent,x,y,z)}
const whale=new THREE.Group();scene.add(whale);whale.visible=false;whale.scale.setScalar(1.18);const whaleBlue=mat(0x397f9f),whaleLight=mat(0xcdebf0),eyeMat=mat(0x173f50);
const whaleBody=sphere(1.06,whaleBlue,whale,0,0,0,14);whaleBody.scale.set(1.7,.67,.72);
const whaleHead=sphere(.78,whaleBlue,whale,1.03,-.04,0,12);whaleHead.scale.set(1.12,.76,.84);
const whaleBelly=sphere(.8,whaleLight,whale,.57,-.4,0,12);whaleBelly.scale.set(1.4,.3,.72);
const tailStock=cone(.42,1.15,whaleBlue,whale,-1.72,.05,0,10);tailStock.rotation.z=Math.PI/2;
for(const s of [-1,1]){const fluke=sphere(.55,whaleBlue,whale,-2.25,.08,s*.4,10);fluke.scale.set(.78,.15,1.03);fluke.rotation.y=s*.3;const flipper=sphere(.48,whaleBlue,whale,-.15,-.3,s*.69,10);flipper.scale.set(.92,.17,.45);flipper.rotation.y=s*.55;sphere(.065,eyeMat,whale,1.12,.16,s*.64,8);sphere(.023,mats.white,whale,1.14,.18,s*.695,7)}
uprightFin(whale,[[-.25,0],[0,.26],[.21,0]],whaleBlue,-.9,.61,-.05,.1);
const spout=[];for(let i=0;i<5;i++)spout.push(sphere(.075,mats.white,whale,.55,.68+i*.18,0,7));
function makeDolphin(){
  const d=new THREE.Group();scene.add(d);d.visible=false;d.scale.setScalar(1.3);const dm=mat(0x70b9ce),belly=mat(0xd5eef0);
  const body=sphere(.48,dm,d,-.1,0,0,12);body.scale.set(1.65,.66,.63);const underside=sphere(.4,belly,d,.15,-.2,0,10);underside.scale.set(1.35,.28,.58);
  const snout=cone(.15,.6,dm,d,.77,-.04,0,9);snout.rotation.z=-Math.PI/2;const stock=cone(.21,.55,dm,d,-.82,0,0,9);stock.rotation.z=Math.PI/2;
  uprightFin(d,[[-.28,0],[-.07,.48],[.13,.06]],dm,-.18,.25,-.06,.12);
  for(const s of [-1,1]){const fluke=sphere(.25,dm,d,-1.12,.02,s*.2,9);fluke.scale.set(.8,.14,1.1);fluke.rotation.y=s*.4;const fin=sphere(.25,dm,d,-.16,-.17,s*.33,9);fin.scale.set(1,.18,.42);fin.rotation.y=s*.6;sphere(.045,eyeMat,d,.41,.12,s*.27,7)}return d;
}
const dolphins=[makeDolphin(),makeDolphin(),makeDolphin()];
let whaleStart=-100,whaleNext=5+Math.random()*5,dolphinStart=-100,dolphinNext=1.8+Math.random()*2,dolphinSide=1,whaleSide=1,whaleX=0;
function animateSea(t,delta){
  clouds.forEach((c,i)=>{c.position.x+=delta*(.45+i*.08);if(c.position.x>27)c.position.x=-27});
  if(t>whaleNext){whaleStart=t;whaleNext=t+21+Math.random()*15;whaleSide=Math.random()<.5?-1:1;whaleX=(Math.random()-.5)*4}
  const wu=(t-whaleStart)/7.5;whale.visible=wu>=0&&wu<=1;if(whale.visible){const smooth=x=>x*x*(3-2*x);const surface=wu<.25?smooth(wu/.25):wu>.75?smooth((1-wu)/.25):1;whale.position.set(whaleX,seaLevel-.75+surface*.8,14.7);whale.rotation.set(0,whaleSide<0?Math.PI:0,0);spout.forEach((p,i)=>{p.visible=wu>.25&&wu<.75;p.position.y=.48+i*.18+Math.sin(t*6+i)*.06})}
  if(t>dolphinNext){dolphinStart=t;dolphinNext=t+10+Math.random()*8;dolphinSide=Math.random()<.5?-1:1}
  dolphins.forEach((d,i)=>{const u=(t-dolphinStart-i*.45)/4.6;d.visible=u>=0&&u<=1;if(d.visible){d.position.set(dolphinSide*(-2.5+u*5.1)+i*.55,seaLevel-.08+Math.sin(u*Math.PI)*1.85,-14.25-i*.75);d.rotation.y=dolphinSide<0?Math.PI:0;d.rotation.z=Math.atan2(1.85*Math.PI*Math.cos(u*Math.PI),5.1)}});
}

const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let hovered=-1,active=-1,dragStart=null,toastTimer=null;
function getStars(i){return i===0?getFirstLevelStars():Math.min(3,Math.max(0,Number(saved[i]||0)))}
function save(){try{localStorage.setItem('fantasy-block-stars',JSON.stringify(saved))}catch{}}
function renderProgress(){const total=ZONES.reduce((n,_,i)=>n+getStars(i),0);document.querySelector('#totalStars').innerHTML=`${total} <small>/ 33</small>`;document.querySelector('#progressFill').style.width=`${total/33*100}%`;document.querySelector('#zoneGrid').innerHTML=ZONES.map((z,i)=>{const max=i===0?6:3,stars=getStars(i);return `<button type="button" class="zone-card" data-zone="${i}" aria-label="進入第 ${i+1} 關 ${z.name}，已獲得 ${stars} 顆星，共 ${max} 顆"><span class="zone-card-icon" style="background:${z.tint}">${z.icon}</span><span><span class="zone-card-meta">ZONE ${String(i+1).padStart(2,'0')} · ${z.area}</span><strong>${z.name}</strong><span class="zone-card-stars">${'★'.repeat(stars)}<span class="empty">${'★'.repeat(max-stars)}</span></span></span><span class="zone-card-arrow">↗</span></button>`}).join('');document.querySelectorAll('.zone-card').forEach(b=>b.addEventListener('click',()=>enterZone(Number(b.dataset.zone))));signs.forEach((s,i)=>{s.material.map.dispose();s.material.map=textTexture(ZONES[i].name,getStars(i),i===0?6:3);s.material.needsUpdate=true})}
function toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2300)}
function renderTasks(){if(active<0)return;const i=active,z=ZONES[i],stars=getStars(i);document.querySelector('#sceneStars').innerHTML=`${'★'.repeat(stars)}<span class="empty">${'★'.repeat(3-stars)}</span>`;document.querySelector('#taskList').innerHTML=z.tasks.map((task,j)=>`<button type="button" class="task-btn ${j<stars?'done':''}" data-task="${j}" ${j<stars?'disabled':''}><span class="task-number">${j<stars?'✓':j+1}</span>${task}<span>${j<stars?'完成':'＋'}</span></button>`).join('');document.querySelectorAll('.task-btn:not(:disabled)').forEach(b=>b.addEventListener('click',()=>{const j=Number(b.dataset.task);if(j!==getStars(i)){toast('請依照順序完成任務 ✦');return}saved[i]=j+1;save();chime();renderTasks();renderProgress();toast(j===2?'太棒了！這一關的三顆星都收集到了 ★':'獲得一顆星星！ ★');if(j===2)document.querySelector('#sceneFooter').textContent='全部任務完成！可以前往下一站囉。'}))}
let cameraMove=null;
function tweenCamera(toPos,toTarget,toZoom,duration=950){cameraMove={fromPos:camera.position.clone(),fromTarget:controls.target.clone(),fromZoom:camera.zoom,toPos,toTarget,toZoom,start:performance.now(),duration}}
function enterZone(i){document.documentElement.style.overflow='hidden';document.documentElement.scrollTop=0;document.body.scrollTop=0;window.scrollTo({top:0,behavior:'instant'});document.body.style.overflow='hidden';active=i;document.body.classList.add('level-open');hovered=-1;canvas.style.cursor='default';controls.enabled=false;history.replaceState(null,'',`#zone-${i+1}`);if(i===0){startLevelOne({onProgress:renderProgress,onExit:()=>{document.documentElement.style.overflow='';document.body.style.overflow='';document.body.classList.remove('level-open');active=-1;controls.enabled=true;history.replaceState(null,'','#home');renderProgress()}});return}const z=ZONES[i];document.querySelector('#sceneKicker').textContent=`ZONE ${String(i+1).padStart(2,'0')} · ${z.area}`;document.querySelector('#sceneTitle').textContent=z.name;document.querySelector('#sceneDescription').textContent=z.description;document.querySelector('#sceneFooter').textContent=getStars(i)===3?'全部任務完成！可以前往下一站囉。':'完成三個任務，收集全部星星！';renderTasks();const overlay=document.querySelector('#sceneOverlay');overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');const wide=window.innerWidth>1100;const view=i===2?[6,8,-11]:i===3?[-6,8,-11]:[wide?8:6,8,11];tweenCamera(new THREE.Vector3(z.x+view[0],z.y+view[1],z.z+view[2]),new THREE.Vector3(z.x,z.y+1.15,z.z),wide?2.3:2.65,1150)}
function exitZone(){document.documentElement.style.overflow='';document.body.style.overflow='';active=-1;document.body.classList.remove('level-open');document.querySelector('#sceneOverlay').classList.remove('open');document.querySelector('#sceneOverlay').setAttribute('aria-hidden','true');controls.enabled=true;tweenCamera(new THREE.Vector3(31,28,36),new THREE.Vector3(0,.5,0),1,1050);history.replaceState(null,'','#home')}
document.querySelector('#closeScene').addEventListener('click',exitZone);document.querySelector('#backButton').addEventListener('click',exitZone);document.querySelector('#sceneBackdrop').addEventListener('click',exitZone);window.addEventListener('keydown',e=>{if(e.key==='Escape'&&active>=0)exitZone()});document.querySelector('#startButton').addEventListener('click',()=>enterZone(0));
function pick(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(hitTargets,false)[0]?.object.userData.zone??-1}
canvas.addEventListener('pointerdown',e=>{dragStart={x:e.clientX,y:e.clientY}});canvas.addEventListener('pointermove',e=>{if(active>=0)return;if(e.buttons)return;const next=pick(e);if(next!==hovered){hovered=next;canvas.style.cursor=next>=0?'pointer':'grab'}});canvas.addEventListener('pointerup',e=>{if(active>=0||!dragStart)return;if(Math.hypot(e.clientX-dragStart.x,e.clientY-dragStart.y)<7){const n=pick(e);if(n>=0)enterZone(n)}dragStart=null});canvas.addEventListener('pointerleave',()=>{hovered=-1;dragStart=null;canvas.style.cursor='grab'});
let soundEnabled=true,audioContext=null;function chime(){if(!soundEnabled)return;try{audioContext ||= new (window.AudioContext||window.webkitAudioContext)();const now=audioContext.currentTime;for(const [i,note] of [660,880,1100].entries()){const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=note;gain.gain.setValueAtTime(.0001,now+i*.09);gain.gain.exponentialRampToValueAtTime(.075,now+i*.09+.02);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.09+.35);osc.connect(gain).connect(audioContext.destination);osc.start(now+i*.09);osc.stop(now+i*.09+.36)}}catch{}}
document.querySelector('#soundButton').addEventListener('click',()=>{const b=document.querySelector('#soundButton');soundEnabled=!soundEnabled;b.classList.toggle('muted',!soundEnabled);b.textContent=soundEnabled?'♪':'♩';toast(soundEnabled?'音效已開啟':'音效已關閉');if(soundEnabled)chime()});
let motionPaused=false;document.querySelector('#motionButton').addEventListener('click',()=>{motionPaused=!motionPaused;const b=document.querySelector('#motionButton');b.classList.toggle('paused',motionPaused);b.textContent=motionPaused?'▶':'Ⅱ';b.setAttribute('aria-label',motionPaused?'播放動畫':'暫停動畫');b.setAttribute('title',motionPaused?'播放動畫':'暫停動畫');b.setAttribute('aria-pressed',String(motionPaused));toast(motionPaused?'動畫已暫停':'動畫播放中')});
function resize(){const w=wrap.clientWidth,h=wrap.clientHeight;renderer.setSize(w,h,false);const aspect=w/h;const size=window.innerWidth<550?58:window.innerWidth<1100?42:33;camera.left=-size*aspect/2;camera.right=size*aspect/2;camera.top=size/2;camera.bottom=-size/2;camera.updateProjectionMatrix()}
window.addEventListener('resize',resize);resize();renderProgress();const linkedZone=location.hash.match(/^#zone-(10|[1-9])$/);if(linkedZone)enterZone(Number(linkedZone[1])-1);
const clock=new THREE.Clock();let animationTime=0;
function animate(){
  requestAnimationFrame(animate);const delta=Math.min(clock.getDelta(),.05);if(!motionPaused)animationTime+=delta;const time=animationTime;
  if(cameraMove){let t=Math.min(1,(performance.now()-cameraMove.start)/cameraMove.duration);t=t*t*(3-2*t);camera.position.lerpVectors(cameraMove.fromPos,cameraMove.toPos,t);controls.target.lerpVectors(cameraMove.fromTarget,cameraMove.toTarget,t);camera.zoom=THREE.MathUtils.lerp(cameraMove.fromZoom,cameraMove.toZoom,t);camera.updateProjectionMatrix();if(t>=1)cameraMove=null}
  controls.update();
  if(!motionPaused){
    for(const a of animated){a.obj.rotation[a.obj.userData.spinAxis||'z']-=a.speed*delta*60*(active===a.zone?1.8:1);if(a.cabins)a.cabins.forEach(c=>c.rotation.z=-a.obj.rotation.z)}
    fx.forEach(f=>f(time,delta));animateSea(time,delta);
  }
  for(let i=0;i<signs.length;i++){const s=signs[i];s.position.y=s.userData.baseY+(motionPaused?0:Math.sin(time*1.6+i*.8)*.12);s.quaternion.copy(camera.quaternion);const target=i===hovered&&active<0?1.16:1;s.scale.lerp(new THREE.Vector3(target,target,target),.12);groups[i].scale.lerp(new THREE.Vector3(target,target,target),.12)}
  renderer.render(scene,camera);
}
animate();


















