// Global vars for both scenes
let coinScene, coinCamera, coinRenderer, coinLogo;
let jarScene, jarCamera, jarRenderer, jar;
let droppedCoins = []; // track dropped coins

// === Init Coin Scene (Hero) ===
function initCoinScene() {
  const canvas = document.getElementById("coin-canvas");

  coinScene = new THREE.Scene();
  coinScene.background = null;

  coinCamera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
  );
  coinCamera.position.set(0, 0, 1000);

  coinRenderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
  });
  coinRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  coinRenderer.setSize(window.innerWidth, window.innerHeight, false);

  const loader = new THREE.GLTFLoader();
  loader.load(
    "https://cdn.jsdelivr.net/gh/kevindakin/penny-jar@v1.1/logo.glb",
    (gltf) => {
      coinLogo = gltf.scene.getObjectByName("CoinLogo");

      coinLogo.traverse((m) => {
        if (m.isMesh) {
          const edges = new THREE.EdgesGeometry(m.geometry, 40);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({
              color: 0xf7f0ed,
              transparent: true,
              opacity: 1,
              depthTest: false,
              depthWrite: false,
            })
          );
          line.renderOrder = 999;
          m.add(line);

          // Invisible fill
          m.material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false,
            depthTest: false,
            colorWrite: false,
          });
        }
      });

      setCoinInitialTransform();
      coinScene.add(coinLogo);
      renderCoin();

      initScrollAnimations();
    }
  );
}

// === Init Jar Scene (Sections 2 + 3) ===
function initJarScene() {
  const canvas = document.getElementById("jar-canvas");

  jarScene = new THREE.Scene();
  jarScene.background = null;

  // Switch to OrthographicCamera to eliminate perspective distortion
  const aspect = window.innerWidth / window.innerHeight;
  const frustumSize = 1000;
  jarCamera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    5000
  );
  jarCamera.position.set(0, 0, 1000);

  jarRenderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
  });
  jarRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  jarRenderer.setSize(window.innerWidth, window.innerHeight, false);

  const loader = new THREE.GLTFLoader();
  loader.load(
    "https://cdn.jsdelivr.net/gh/kevindakin/penny-jar@v1.11/jar.glb",
    (gltf) => {
      jar = gltf.scene.getObjectByName("Jar");

      jar.traverse((m) => {
        if (m.isMesh) {
          const edges = new THREE.EdgesGeometry(m.geometry, 40);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({
              color: 0xf7f0ed,
              opacity: 1,
              transparent: true,
              depthTest: false,
              depthWrite: false,
            })
          );
          line.renderOrder = 999;
          m.add(line);

          m.material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false,
            depthTest: false,
            colorWrite: false,
          });
        }
      });

      // Add helper side lines
      const material = new THREE.LineBasicMaterial({
        color: 0xf7f0ed,
        transparent: true,
        opacity: 0.8,
        depthTest: false,
        depthWrite: false,
      });

      const pointsLeft = [
        new THREE.Vector3(-163, 45, 0),
        new THREE.Vector3(-163, 366, 0),
      ];
      const pointsRight = [
        new THREE.Vector3(163, 45, 0),
        new THREE.Vector3(163, 366, 0),
      ];

      const geometryLeft = new THREE.BufferGeometry().setFromPoints(pointsLeft);
      const geometryRight = new THREE.BufferGeometry().setFromPoints(
        pointsRight
      );

      const lineLeft = new THREE.Line(geometryLeft, material.clone());
      const lineRight = new THREE.Line(geometryRight, material.clone());

      jar.add(lineLeft);
      jar.add(lineRight);

      jar.position.set(0, -275, 0);
      jar.scale.set(1.5, 1.5, 1.5);
      jar.rotation.set(0.15, -0.2, 0);

      jarScene.add(jar);
      renderJar();

      // Scroll animations: mobile vs desktop
      if (window.innerWidth < 992) {
        // Mobile: fade out jar + coin
        gsap.to("#jar-canvas", {
          opacity: 0,
          scrollTrigger: {
            trigger: ".home_centered_section",
            start: "top top",
            end: "center+=200 top",
            scrub: true,
          },
        });
        gsap.to("#coin-canvas", {
          opacity: 0,
          scrollTrigger: {
            trigger: ".home_centered_section",
            start: "top top",
            end: "center top",
            scrub: true,
          },
        });
      } else {
        // Desktop/tablet: move + scale jar
        gsap.to(jar.position, {
          x: -440,
          y: -440,
          scrollTrigger: {
            trigger: ".home_testimonials_section",
            start: "top bottom",
            end: "center top",
            scrub: true,
            onUpdate: renderJar,
          },
        });

        gsap.to(jar.scale, {
          x: 1.7,
          y: 1.7,
          z: 1.7,
          scrollTrigger: {
            trigger: ".home_testimonials_section",
            start: "top bottom",
            end: "center top",
            scrub: true,
            onUpdate: renderJar,
          },
        });

        // Clear dropped coins when leaving testimonials section
        gsap.set(
          {},
          {
            scrollTrigger: {
              trigger: ".home_testimonials_section",
              start: "top bottom",
              end: "bottom top",
              onLeave: () => clearDroppedCoins(),
              onLeaveBack: () => clearDroppedCoins(),
            },
          }
        );
      }
    }
  );
}

// === Drop coin clones into jar ===
function dropCoin() {
  if (!coinLogo || !jar) return;

  if (droppedCoins.length > 0) {
    const lastCoin = droppedCoins[droppedCoins.length - 1];
    lastCoin.traverse((m) => {
      if (m.isLine) {
        gsap.to(m.material, {
          opacity: 0,
          duration: 0.8,
          onUpdate: renderJar,
        });
      }
    });
  }

  const newCoin = coinLogo.clone(true);
  newCoin.traverse((m) => {
    if (m.isMesh || m.isLine) {
      m.material = m.material.clone();
    }
  });

  newCoin.position.set((Math.random() - 0.5) * 50, 400, 0);
  newCoin.rotation.set(0, 0, 0);
  newCoin.scale.set(0.4, 0.4, 0.4);

  jar.add(newCoin);
  droppedCoins.push(newCoin);

  gsap.to(newCoin.position, {
    y: 50 + Math.random() * 50,
    duration: 2,
    ease: "bounce.out",
    onUpdate: renderJar,
  });

  gsap.to(newCoin.rotation, {
    x: Math.PI * 2.6,
    y: Math.PI * 2,
    duration: 2,
    ease: "power2.out",
    onUpdate: renderJar,
  });
}

// === Clear dropped coins helper function ===
function clearDroppedCoins() {
  droppedCoins.forEach((coin) => {
    coin.traverse((m) => {
      if (m.isLine) {
        gsap.to(m.material, {
          opacity: 0,
          duration: 0.3,
          onUpdate: renderJar,
          onComplete: () => jar.remove(coin),
        });
      }
    });
  });
  droppedCoins.length = 0;
}

// === Hook into testimonials swiper (desktop only) ===
function initSwiperDrops(swiper) {
  if (window.innerWidth < 992) return;
  setTimeout(() => {
    swiper.on("slideChange", () => {
      if (coinLogo) {
        dropCoin();
      }
    });
  }, 200);
}

// === Responsive helper for CoinLogo ===
function setCoinInitialTransform() {
  if (!coinLogo) return;
  const vw = window.innerWidth;

  if (vw < 768) {
    coinLogo.position.set(120, -70, 0);
    coinLogo.scale.set(1.4, 1.4, 1.4);
    coinLogo.rotation.set(0.4, 0, -0.1);
  } else if (vw < 992) {
    coinLogo.position.set(220, -15, 0);
    coinLogo.scale.set(1.8, 1.8, 1.8);
    coinLogo.rotation.set(0.4, 0, -0.1);
  } else {
    coinLogo.position.set(340, -30, 0);
    coinLogo.scale.set(2.5, 2.5, 2.5);
    coinLogo.rotation.set(0.4, 0, -0.1);
  }
}

// === Render Functions ===
function renderCoin() {
  if (coinRenderer && coinScene && coinCamera) {
    coinRenderer.render(coinScene, coinCamera);
  }
}
function renderJar() {
  if (jarRenderer && jarScene && jarCamera) {
    jarRenderer.render(jarScene, jarCamera);
  }
}

// === Coin scroll animations ===
function initScrollAnimations() {
  gsap.to(coinLogo.position, {
    x: -70,
    y: -170,
    scrollTrigger: {
      trigger: ".hero_home_section",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: renderCoin,
    },
  });

  gsap.to(coinLogo.rotation, {
    x: Math.PI * 0.5,
    y: Math.PI * 2,
    scrollTrigger: {
      trigger: ".hero_home_section",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: renderCoin,
    },
  });

  gsap.to(coinLogo.scale, {
    x: 0.5,
    y: 0.5,
    z: 0.5,
    scrollTrigger: {
      trigger: ".hero_home_section",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: renderCoin,
    },
  });

  if (window.innerWidth > 991) {
    gsap.fromTo(
      coinLogo.position,
      { x: -70, y: -170 },
      {
        x: -440,
        y: -290,
        scrollTrigger: {
          trigger: ".home_testimonials_section",
          start: "top bottom",
          end: "center top",
          scrub: true,
          onUpdate: renderCoin,
        },
      }
    );
  }
}

// Update the resize handler to handle orthographic camera
let resizeTimeout;
function onResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const width = window.innerWidth;
    const height = document.documentElement.clientHeight;
    const aspect = width / height;

    if (coinCamera && coinRenderer) {
      coinCamera.aspect = aspect;
      coinCamera.updateProjectionMatrix();
      coinRenderer.setSize(width, height, false);
      renderCoin();
    }

    if (jarCamera && jarRenderer) {
      // Update orthographic camera on resize
      const frustumSize = 1000;
      jarCamera.left = (frustumSize * aspect) / -2;
      jarCamera.right = (frustumSize * aspect) / 2;
      jarCamera.top = frustumSize / 2;
      jarCamera.bottom = frustumSize / -2;
      jarCamera.updateProjectionMatrix();
      jarRenderer.setSize(width, height, false);
      renderJar();
    }

    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }, 150);
}

// === Init ===
window.addEventListener("resize", onResize);
window.addEventListener("load", () => {
  initCoinScene();
  initJarScene();
});