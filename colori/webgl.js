const VS = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uMVP;
varying vec3 vNormal;
void main(){
  vNormal = aNormal;
  gl_Position = uMVP * vec4(aPosition, 1.0);
}`;

const FS = `
precision mediump float;
varying vec3 vNormal;
uniform vec3 uColor;
uniform float uAlpha;
void main(){
  vec3 n = normalize(vNormal);
  vec3 l = normalize(vec3(0.45, 0.85, 0.60));
  float diffuse = max(dot(n,l), 0.0);
  float light = 0.30 + 0.70 * diffuse;
  gl_FragColor = vec4(uColor * light, uAlpha);
}`;

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function mat4Identity(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);}
function mat4Mul(a,b){
  const o=new Float32Array(16);
  for(let c=0;c<4;c++) for(let r=0;r<4;r++){
    o[c*4+r]=a[0*4+r]*b[c*4+0]+a[1*4+r]*b[c*4+1]+a[2*4+r]*b[c*4+2]+a[3*4+r]*b[c*4+3];
  }
  return o;
}
function mat4Translate(x,y,z){const m=mat4Identity();m[12]=x;m[13]=y;m[14]=z;return m;}
function mat4Scale(x,y,z){const m=mat4Identity();m[0]=x;m[5]=y;m[10]=z;return m;}
function mat4RotX(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]);}
function mat4RotY(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]);}
function mat4RotZ(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]);}
function modelMatrix(p=[0,0,0],r=[0,0,0],s=[1,1,1]){
  return mat4Mul(mat4Translate(p[0],p[1],p[2]),mat4Mul(mat4RotY(r[1]),mat4Mul(mat4RotX(r[0]),mat4Mul(mat4RotZ(r[2]),mat4Scale(s[0],s[1],s[2])))));
}
function perspective(fov,aspect,near,far){
  const f=1/Math.tan(fov/2),nf=1/(near-far),m=new Float32Array(16);
  m[0]=f/aspect;m[5]=f;m[10]=(far+near)*nf;m[11]=-1;m[14]=2*far*near*nf;
  return m;
}
function lookAt(eye,target,up=[0,1,0]){
  let zx=eye[0]-target[0],zy=eye[1]-target[1],zz=eye[2]-target[2];
  let zl=Math.hypot(zx,zy,zz)||1;zx/=zl;zy/=zl;zz/=zl;
  let xx=up[1]*zz-up[2]*zy,xy=up[2]*zx-up[0]*zz,xz=up[0]*zy-up[1]*zx;
  let xl=Math.hypot(xx,xy,xz)||1;xx/=xl;xy/=xl;xz/=xl;
  const yx=zy*xz-zz*xy, yy=zz*xx-zx*xz, yz=zx*xy-zy*xx;
  return new Float32Array([
    xx,yx,zx,0,
    xy,yy,zy,0,
    xz,yz,zz,0,
    -(xx*eye[0]+xy*eye[1]+xz*eye[2]),
    -(yx*eye[0]+yy*eye[1]+yz*eye[2]),
    -(zx*eye[0]+zy*eye[1]+zz*eye[2]),1
  ]);
}
function color(c){
  if(Array.isArray(c)) return c;
  const h=c.replace('#','');
  return [parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255];
}

function sphere(lat=18,lon=24,deform){
  const p=[],n=[],i=[];
  for(let y=0;y<=lat;y++){
    const ph=y/lat*Math.PI, sp=Math.sin(ph),cp=Math.cos(ph);
    for(let x=0;x<=lon;x++){
      const th=x/lon*Math.PI*2,sx=sp*Math.cos(th),sy=cp,sz=sp*Math.sin(th);
      const k=deform?deform(sx,sy,sz):1;
      p.push(sx*k,sy,sz*k);n.push(sx,sy,sz);
    }
  }
  for(let y=0;y<lat;y++) for(let x=0;x<lon;x++){
    const a=y*(lon+1)+x,b=a+lon+1;i.push(a,b,a+1,b,b+1,a+1);
  }
  return {p,n,i};
}
function cube(){
  const p=[],n=[],i=[];
  const faces=[
    [[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[0,0,1]],
    [[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],[0,0,-1]],
    [[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1],[0,1,0]],
    [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[0,-1,0]],
    [[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1],[1,0,0]],
    [[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,0,0]]
  ];
  faces.forEach(f=>{const o=p.length/3;for(let k=0;k<4;k++){p.push(...f[k]);n.push(...f[4]);}i.push(o,o+1,o+2,o,o+2,o+3);});
  return {p,n,i};
}
function cylinder(seg=20){
  const p=[],n=[],i=[];
  for(let s=0;s<=seg;s++){const a=s/seg*Math.PI*2,x=Math.cos(a),z=Math.sin(a);p.push(x,-1,z,x,1,z);n.push(x,0,z,x,0,z);}
  for(let s=0;s<seg;s++){const a=s*2;i.push(a,a+1,a+2,a+1,a+3,a+2);}
  return {p,n,i};
}
function triangularPrism(){
  const p=[-1,-1,1,1,-1,1,0,1,1,-1,-1,-1,0,1,-1,1,-1,-1,-1,-1,1,0,1,1,-1,-1,-1,0,1,-1,0,1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,-1,1];
  const n=[];for(let k=0;k<p.length/3;k++)n.push(0,0,1);
  const i=[];for(let k=0;k<p.length/9;k++)i.push(k*3,k*3+1,k*3+2);
  return {p,n,i};
}
function makeMesh(gl,d){
  const m={};
  m.pb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,m.pb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d.p),gl.STATIC_DRAW);
  m.nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,m.nb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d.n),gl.STATIC_DRAW);
  m.ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(d.i),gl.STATIC_DRAW);
  m.count=d.i.length;return m;
}
function compile(gl,type,source){
  const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error('Shader: '+(gl.getShaderInfoLog(s)||'errore sconosciuto'));
  return s;
}
function makeProgram(gl){
  const p=gl.createProgram();gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,VS));gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,FS));gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error('Programma WebGL: '+(gl.getProgramInfoLog(p)||'link fallito'));
  return p;
}

export function wavelengthColor(w){
  let r=0,g=0,b=0;
  if(w<440){r=-(w-440)/60;b=1}else if(w<490){g=(w-440)/50;b=1}else if(w<510){g=1;b=-(w-510)/20}else if(w<580){r=(w-510)/70;g=1}else if(w<645){r=1;g=-(w-645)/65}else r=1;
  let k=1;if(w<420)k=.3+.7*(w-380)/40;else if(w>645)k=.3+.7*(700-w)/55;
  return [Math.pow(r*k,.8),Math.pow(g*k,.8),Math.pow(b*k,.8)];
}
export function responses(w){
  const G=(m,s)=>Math.exp(-.5*Math.pow((w-m)/s,2));
  return {s:G(445,34),m:G(535,48),l:G(575,58)};
}

export class LabRenderer{
  constructor(canvas){
    if(!canvas) throw new Error('Canvas 3D non trovato');
    this.canvas=canvas;
    const opts={alpha:false,antialias:true,depth:true,stencil:false,preserveDrawingBuffer:false};
    let gl=null;
    try{gl=canvas.getContext('webgl',opts);}catch(_e){}
    if(!gl){try{gl=canvas.getContext('experimental-webgl',opts);}catch(_e){}}
    if(!gl) throw new Error('Il browser non ha creato un contesto WebGL');
    this.gl=gl;
    this.program=makeProgram(gl);gl.useProgram(this.program);
    this.aPos=gl.getAttribLocation(this.program,'aPosition');
    this.aNorm=gl.getAttribLocation(this.program,'aNormal');
    this.uMVP=gl.getUniformLocation(this.program,'uMVP');
    this.uColor=gl.getUniformLocation(this.program,'uColor');
    this.uAlpha=gl.getUniformLocation(this.program,'uAlpha');
    this.mesh={
      sphere:makeMesh(gl,sphere()),
      apple:makeMesh(gl,sphere(22,28,(x,y,z)=>{let k=1-.12*Math.max(y,0)+.05*Math.cos(Math.atan2(z,x)*2)*(1-y*y);if(y>.72)k-=.18*(y-.72)/.28;return k;})),
      cube:makeMesh(gl,cube()),
      cyl:makeMesh(gl,cylinder()),
      prism:makeMesh(gl,triangularPrism())
    };
    this.mode='world';
    this.state={analyze:false,wavelength:550,rgb:[255,150,55],eyeWave:560,built:false,context:'day',observer:'human',final:0};
    this.drag={down:false,x:0,y:0,yaw:0,pitch:0};
    this.reduced=false;this.contextLost=false;
    this.bind();this.resize();
    requestAnimationFrame(t=>this.frame(t));
  }
  bind(){
    const c=this.canvas;
    c.addEventListener('webglcontextlost',e=>{e.preventDefault();this.contextLost=true;});
    c.addEventListener('webglcontextrestored',()=>{this.contextLost=false;});
    c.addEventListener('pointerdown',e=>{this.drag.down=true;this.drag.x=e.clientX;this.drag.y=e.clientY;try{c.setPointerCapture(e.pointerId)}catch(_e){}});
    c.addEventListener('pointermove',e=>{if(!this.drag.down)return;this.drag.yaw=clamp(this.drag.yaw+(e.clientX-this.drag.x)*.004,-.45,.45);this.drag.pitch=clamp(this.drag.pitch+(e.clientY-this.drag.y)*.003,-.22,.22);this.drag.x=e.clientX;this.drag.y=e.clientY;});
    const up=()=>{this.drag.down=false;};c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);c.addEventListener('pointerleave',up);
    addEventListener('resize',()=>this.resize());
  }
  setMode(m){this.mode=m;this.drag.yaw=0;this.drag.pitch=0;}
  setReduced(v){this.reduced=!!v;}
  resize(){
    const d=Math.min(window.devicePixelRatio||1,1.5),r=this.canvas.getBoundingClientRect();
    const w=Math.max(2,Math.round(r.width*d)),h=Math.max(2,Math.round(r.height*d));
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
  }
  view(base=[0,1,7],target=[0,0,0],fov=44){
    const rad=Math.hypot(base[0],base[2]),ang=Math.atan2(base[0],base[2])+this.drag.yaw;
    const eye=[Math.sin(ang)*rad,base[1]+this.drag.pitch*rad*.55,Math.cos(ang)*rad];
    const V=lookAt(eye,target),P=perspective(fov*Math.PI/180,this.canvas.width/this.canvas.height,.1,80);
    this.vp=mat4Mul(P,V);
  }
  clear(rgb=[.025,.035,.045]){
    const g=this.gl;this.resize();g.viewport(0,0,this.canvas.width,this.canvas.height);g.clearColor(rgb[0],rgb[1],rgb[2],1);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);g.enable(g.DEPTH_TEST);g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);g.disable(g.CULL_FACE);
  }
  draw(kind,p,r,s,c,a=1){
    const g=this.gl,m=this.mesh[kind],M=modelMatrix(p,r,s),mvp=mat4Mul(this.vp,M);
    glUse(g,this.program);g.uniformMatrix4fv(this.uMVP,false,mvp);g.uniform3fv(this.uColor,color(c));g.uniform1f(this.uAlpha,a);
    g.bindBuffer(g.ARRAY_BUFFER,m.pb);g.enableVertexAttribArray(this.aPos);g.vertexAttribPointer(this.aPos,3,g.FLOAT,false,0,0);
    g.bindBuffer(g.ARRAY_BUFFER,m.nb);g.enableVertexAttribArray(this.aNorm);g.vertexAttribPointer(this.aNorm,3,g.FLOAT,false,0,0);
    g.bindBuffer(g.ELEMENT_ARRAY_BUFFER,m.ib);g.depthMask(a>.98);g.drawElements(g.TRIANGLES,m.count,g.UNSIGNED_SHORT,0);g.depthMask(true);
  }
  beam(a,b,w,c,alpha=.35){
    const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz),yaw=-Math.atan2(dz,dx),pitch=Math.atan2(dy,Math.hypot(dx,dz));
    this.draw('cube',[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[0,yaw,pitch],[len/2,w,w],c,alpha);
  }
  apple(p=[0,0,0],s=1,c='#8d2632',a=1){
    this.draw('apple',p,[0,.2,0],[s*.98,s,s*.94],c,a);
    this.draw('cyl',[p[0]+.05*s,p[1]+1.04*s,p[2]],[0,0,.12],[.07*s,.30*s,.07*s],'#39271c',a);
    this.draw('sphere',[p[0]+.34*s,p[1]+1.08*s,p[2]],[0,0,-.5],[.42*s,.07*s,.18*s],'#36563d',a);
  }
  sceneWorld(t){
    this.clear([.16,.23,.27]);this.view([1.0,1.25,7.4],[0,.15,0],45);
    this.draw('cube',[0,-1.55,0],[0,0,0],[5.5,.12,5.4],'#29392f');
    this.draw('cyl',[-2.2,-.35,-1],[0,0,0],[.26,1.25,.26],'#493329');
    this.draw('sphere',[-2.45,.72,-1],[0,0,0],[1.0,.78,.95],'#31543a');
    this.draw('sphere',[-1.95,.95,-1],[0,0,0],[.92,.72,.86],'#294a34');
    this.apple([1.75,-.55,.2],.9,'#912a35');
    for(let k=0;k<8;k++){const x=-1.3+k*.42,z=-.3+(k%3)*.3;this.draw('cyl',[x,-1.05,z],[0,0,0],[.025,.32,.025],'#355842');this.draw('sphere',[x,-.70,z],[0,0,0],[.10,.04,.15],k%2?'#8b4053':'#c6a96f');}
    if(!this.reduced){const q=.03*Math.sin(t*.00025);this.drag.yaw+=q*.002;}
  }
  sceneApple(){
    this.clear([.025,.035,.045]);this.view([0,.7,6],[0,.2,0],42);this.apple([0,-.15,0],1.45,this.state.analyze?'#66686a':'#982e39');
    if(this.state.analyze){this.beam([-4,2,1],[-1,.5,.2],.025,'#efe6cf',.75);this.beam([1,.3,.1],[4,1.4,1],.022,'#c4414d',.65);this.beam([1,.1,.2],[4,.2,-.5],.018,'#bd7848',.45);}
  }
  sceneLight(){
    this.clear([.01,.015,.022]);this.view([.2,.8,7],[0,0,0],43);this.draw('prism',[0,0,0],[0,.15,0],[1.25,1.25,.7],'#8aa8b2',.35);this.beam([-5,0,0],[-1.1,0,0],.03,'#f1ead9',.85);
    const cols=['#704bcf','#416fd0','#32a4be','#55ad78','#c9b84d','#d17a3f','#b63649'];for(let k=0;k<7;k++)this.beam([1.1,0,0],[5,(k-3)*.42,0],.025,cols[k],.56);
    const c=wavelengthColor(this.state.wavelength);this.draw('sphere',[3.9,(this.state.wavelength-540)/180,0],[0,0,0],[.12,.12,.12],c,1);
  }
  sceneRGB(){
    this.clear([.008,.012,.016]);this.view([0,1.3,7],[0,0,0],44);this.draw('cube',[0,-1.4,0],[0,0,0],[5,.06,4],'#1b2025');
    const v=this.state.rgb.map(x=>x/255);const src=[[-3,1.4,-1.4],[-3,-.2,-1.4],[3,1.4,-1.4]],cols=['#ff2222','#22ff55','#2255ff'];
    src.forEach((p,k)=>{this.draw('cyl',p,[Math.PI/2,0,0],[.22,.35,.22],'#3a4248');this.beam(p,[0,0,.4],.10,cols[k],.10+.42*v[k]);});
    const mix=[v[0],v[1],v[2]];this.draw('sphere',[0,0,.4],[0,0,0],[1.25,1.25,.18],mix,.95);
  }
  sceneEye(){
    this.clear([.02,.03,.038]);this.view([0,.5,7],[0,0,0],43);
    this.draw('sphere',[0,0,0],[0,0,0],[2.1,1.65,1.65],'#9eb3ba',.16);this.draw('sphere',[-1.55,0,0],[0,0,0],[.6,1.0,1.0],'#6e8f91',.55);this.draw('sphere',[-1.72,0,0],[0,0,0],[.28,.58,.58],'#050708',1);this.draw('sphere',[-.9,0,0],[0,0,0],[.28,.78,.78],'#c2d0d4',.25);this.draw('cyl',[2.25,0,0],[0,0,Math.PI/2],[.18,.8,.18],'#a7804e');
    const c=wavelengthColor(this.state.eyeWave);this.beam([-5,0,0],[1.55,0,0],.025,c,.78);const rr=responses(this.state.eyeWave);[['#6c72c9',rr.s,-.55],['#4c9a72',rr.m,0],['#bd5963',rr.l,.55]].forEach(x=>this.draw('sphere',[1.65,x[2],0],[0,0,0],[.08+.18*x[1],.08+.18*x[1],.08+.18*x[1]],x[0],1));
  }
  sceneNeural(t){
    this.clear([.008,.012,.018]);this.view([0,.5,7],[0,0,0],45);const xs=[-3,-1,1,3];for(let k=0;k<4;k++){this.draw('sphere',[xs[k],0,0],[0,0,0],[.45,.45,.45],k===3&&this.state.built?'#8e2d38':'#6b7479');if(k<3)this.beam([xs[k]+.45,0,0],[xs[k+1]-.45,0,0],.025,'#8d7652',.5);}
    for(let k=0;k<3;k++){const q=((t*.00045+k*.29)%1),x=-2.55+q*5.1;this.draw('sphere',[x,.12,0],[0,0,0],[.08,.08,.08],'#d6bc82');}
    if(this.state.built)this.apple([3,-.95,0],.6,'#912b36');
  }
  sceneContext(){
    const modes={day:[[.16,.23,.27],'#922d38'],sunset:[[.24,.10,.06],'#a03b2f'],cold:[[.07,.13,.20],'#7b3446'],shadow:[[.025,.035,.05],'#6c2633']]};const m=modes[this.state.context]||modes.day;
    this.clear(m[0]);this.view([0,.7,6],[0,0,0],42);this.apple([0,-.15,0],1.45,m[1]);this.draw('sphere',[-3.3,2.3,-1],[0,0,0],[.35,.35,.35],this.state.context==='cold'?'#b8d7ff':this.state.context==='sunset'?'#ff9360':'#f0e0b8',.85);
  }
  sceneObserver(){
    this.clear([.08,.12,.12]);this.view([0,.8,6],[0,0,0],43);const obs=this.state.observer;let petal='#8a3452',center='#c3a55f';if(obs==='dog'){petal='#777d63';center='#b5a867'}if(obs==='bee'){petal='#7250a2';center='#d4e65c'}if(obs==='bird'){petal='#b22b72';center='#e1c956'}
    for(let k=0;k<7;k++){const a=k/7*Math.PI*2;this.draw('sphere',[Math.cos(a)*1.1,Math.sin(a)*1.1,0],[0,0,a],[.55,1.0,.25],petal,.98);}this.draw('sphere',[0,0,.1],[0,0,0],[.65,.65,.35],center,1);if(obs==='bee')for(let k=0;k<7;k++){const a=k/7*Math.PI*2;this.draw('sphere',[Math.cos(a)*.63,Math.sin(a)*.63,.24],[0,0,0],[.15,.15,.06],'#29203d',.85);}
  }
  sceneFinal(t){
    this.clear([.02,.028,.036]);this.view([0,.7,6],[0,.05,0],42);const L=this.state.final;
    if(L<3){const c=L===0?'#952d38':L===1?'#70484c':'#727272';this.apple([0,-.15,0],1.45,c,1);}else if(L===3){for(let y=-3;y<=3;y++)for(let x=-5;x<=5;x++){const d=x*x/25+y*y/9;if(d<1.1)this.draw('sphere',[x*.25,y*.25,0],[0,0,0],[.045,.045,.045],'#8ec8d1',.35+.45*(1-d));}}else if(L===4){for(let k=0;k<5;k++){const yy=(k-2)*.35;this.beam([-3,yy,0],[3,yy,0],.015,'#a8d4db',.45);for(let q=0;q<5;q++){const x=-2.5+((t*.0006+q*.2+k*.11)%1)*5;this.draw('sphere',[x,yy,0],[0,0,0],[.05,.05,.05],'#d6bc82');}}}else{for(let k=0;k<7;k++){const c=wavelengthColor(390+k*48);this.beam([-3,-1.2+k*.4,0],[3,-1.2+k*.4,0],.018,c,.55);}}
  }
  render(t){
    if(this.contextLost)return;
    switch(this.mode){case'world':return this.sceneWorld(t);case'apple':return this.sceneApple(t);case'light':return this.sceneLight(t);case'rgb':return this.sceneRGB(t);case'eye':return this.sceneEye(t);case'neural':return this.sceneNeural(t);case'context':return this.sceneContext(t);case'observer':return this.sceneObserver(t);case'final':return this.sceneFinal(t);default:return this.sceneWorld(t);}
  }
  frame(t){try{this.render(t);}catch(err){console.error('Errore rendering 3D:',err);return;}requestAnimationFrame(x=>this.frame(x));}
}
function glUse(gl,p){gl.useProgram(p);}
