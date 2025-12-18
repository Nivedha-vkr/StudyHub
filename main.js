    /* Lightweight 2.5D parallax & particles
       - Mouse move -> small transform on layers and content for depth
       - Scroll subtle parallax
       - Particle generation
    */

    (function(){
      const page = document.getElementById('page');
      const content = document.getElementById('content');
      const layerAurora = document.getElementById('layer-aurora');
      const layerNebula = document.getElementById('layer-nebula');
      const layerParticles = document.getElementById('layer-particles');
      const layerHorizon = document.getElementById('layer-horizon');
      const floatingCard = document.querySelector('.floating-card');

      // particle creation
      const PARTICLE_COUNT = Math.min(18, Math.floor(window.innerWidth / 60));
      for(let i=0;i<PARTICLE_COUNT;i++){
        const p = document.createElement('div');
        p.className = 'particle';
        const left = Math.random()*100;
        const top = 60 + Math.random()*35; // near bottom area
        const s = 4 + Math.random()*10;
        p.style.left = left + '%';
        p.style.top = top + '%';
        p.style.width = s + 'px';
        p.style.height = s + 'px';
        p.style.opacity = (0.15 + Math.random()*0.6).toFixed(2);
        p.style.transform = `translateZ(${ -120 + Math.random()*60 }px)`;
        layerParticles.appendChild(p);
        // animate translateY via CSS using JS for random durations
        p.animate([
          { transform: p.style.transform + ' translateY(0px)', opacity: p.style.opacity },
          { transform: p.style.transform + ' translateY(-140vh)', opacity: 0 }
        ], {
          duration: 10000 + Math.random()*12000,
          iterations: Infinity,
          delay: Math.random()*-12000,
          easing: 'linear'
        });
      }

      // mouse parallax
      let mouseX = 0, mouseY = 0, px = 0, py = 0;
      const damp = 0.06;
      const onMove = (e) => {
        const rect = page.getBoundingClientRect();
        mouseX = ( (e.clientX - rect.left) / rect.width - 0.5 ) * 2; // -1..1
        mouseY = ( (e.clientY - rect.top) / rect.height - 0.5 ) * 2;
      };
      window.addEventListener('pointermove', onMove, {passive:true});

      // scroll parallax amount
      let lastScrollY = window.scrollY;
      function update(){
        px += (mouseX - px) * damp;
        py += (mouseY - py) * damp;

        // apply transforms to layers (different strengths)
        const auroraTx = px * 18;
        const auroraTy = py * 10;
        layerAurora.style.transform = `translateZ(-220px) translate(${auroraTx}px, ${auroraTy}px) scale(1.03)`;

        const nebulaTx = px * -12;
        const nebulaTy = py * -8;
        layerNebula.style.transform = `translateZ(-160px) translate(${nebulaTx}px, ${nebulaTy}px) scale(1.02)`;

        const horizonTx = px * -8;
        layerHorizon.style.transform = `translateZ(-40px) translate(${horizonTx}px, ${py*6}px)`;

        // lift content slightly toward pointer
        const contentTx = px * 10;
        const contentTy = py * 8;
        content.style.transform = `translateZ(0px) rotateX(${py*4}deg) rotateY(${ -px*4 }deg) translate(${ -contentTx/10 }px, ${ -contentTy/10 }px)`;

        // floating card subtle rotation
        floatingCard.style.transform = `translate(-50%,-50%) translateZ(30px) rotateX(${Math.max(-6, Math.min(6, py*8))}deg) rotateY(${Math.max(-6, Math.min(6, -px*6))}deg)`;

        // scroll parallax for certain elements
        const sc = window.scrollY;
        const diff = sc - lastScrollY;
        lastScrollY = sc;
        // small parallax translate on aurora based on scroll
        layerAurora.style.transform += ` translateY(${ sc * -0.03 }px)`;
        layerNebula.style.transform += ` translateY(${ sc * -0.02 }px)`;
        layerHorizon.style.transform += ` translateY(${ sc * -0.01 }px)`;

        requestAnimationFrame(update);
      }
      requestAnimationFrame(update);

      // gentle entrance animations
      window.addEventListener('load', () => {
        content.style.transition = 'transform 900ms cubic-bezier(.2,.9,.3,1), opacity 700ms ease-out';
        content.style.opacity = '1';
      });

      // reduce motion preferences
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if(mq.matches){
        // disable pointer-based transforms & particle animations
        window.removeEventListener('pointermove', onMove);
        layerParticles.innerHTML = '';
      }
    })();
  