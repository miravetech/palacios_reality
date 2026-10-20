window.setupTour=function(k){
 function navigation(){const a=k.get('hotspot');if(!a)return;for(let i=0;i<a.count;i++){const h=a.getItem(i);if(!h.title)continue;h.capture=false;h.capturewheel=false;h.capturefocus=false;h.enabled=!h.videourl&&!!h.onclick;h.ondown='';}}
 navigation();setInterval(navigation,100);
};
