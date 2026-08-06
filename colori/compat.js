(()=>{
  'use strict';
  const originalGetContext=HTMLCanvasElement.prototype.getContext;
  const isWebGLType=t=>t==='webgl'||t==='experimental-webgl';

  HTMLCanvasElement.prototype.getContext=function(type,attrs){
    if(!isWebGLType(type)) return originalGetContext.call(this,type,attrs);
    let gl=null;
    try{ gl=originalGetContext.call(this,type,attrs); }catch(_e){}
    if(!gl){ try{ gl=originalGetContext.call(this,'webgl'); }catch(_e){} }
    if(!gl){ try{ gl=originalGetContext.call(this,'experimental-webgl'); }catch(_e){} }
    return gl;
  };

  // Safari/iPad: usa uno shader GLSL ES 1.00 volutamente conservativo.
  try{
    const probe=document.createElement('canvas');
    const gl=probe.getContext('webgl');
    window.__coloriWebGLProbe={available:!!gl};
    if(gl){
      const proto=Object.getPrototypeOf(gl);
      if(proto && !proto.__coloriShaderCompat){
        const originalShaderSource=proto.shaderSource;
        proto.shaderSource=function(shader,source){
          let safe=source;
          // mediump è più che sufficiente per l'illuminazione di questa PWA e
          // evita incompatibilità con alcuni compilatori shader mobili.
          safe=safe.replace('precision highp float;','precision mediump float;');
          // Evita una conversione mat4→mat3 che alcuni compilatori Safari/WebKit
          // hanno gestito in modo meno prevedibile. Le scene usano luce didattica,
          // quindi la normale locale è sufficiente per questo renderer leggero.
          safe=safe.replace('vNormal=mat3(uModel)*aNormal;','vNormal=aNormal;');
          return originalShaderSource.call(this,shader,safe);
        };
        proto.__coloriShaderCompat=true;
      }
      try{ gl.getExtension('WEBGL_lose_context')?.loseContext(); }catch(_e){}
    }
  }catch(err){
    window.__coloriWebGLProbe={available:false,error:String(err?.message||err)};
  }

  // Conserva il primo errore del renderer: se il fallback appare, possiamo
  // distinguere un problema WebGL reale da un errore di inizializzazione.
  const originalError=console.error.bind(console);
  console.error=(...args)=>{
    originalError(...args);
    try{
      const msg=args.map(v=>v instanceof Error?v.message:String(v)).join(' ');
      window.__coloriRendererError=msg;
      setTimeout(()=>{
        const fb=document.getElementById('fallback');
        if(!fb || fb.hidden) return;
        const strong=fb.querySelector('strong');
        const span=fb.querySelector('span');
        if(strong) strong.textContent='Il renderer 3D non si è inizializzato.';
        if(span) span.textContent=`Dettaglio tecnico: ${msg}`;
      },0);
    }catch(_e){}
  };
})();