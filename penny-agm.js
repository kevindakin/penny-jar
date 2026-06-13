const INTRO_SECTION = ".scroller_section";

const FINAL_COIN_Y = -30;

// Global vars for both scenes
let coinScene, coinCamera, coinRenderer, coinLogo;
let jarScene, jarCamera, jarRenderer, jar;

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
    "https://cdn.jsdelivr.net/gh/kevindakin/penny-jar@v1.06/logo_rev.glb",
    (gltf) => {
      coinLogo = gltf.scene.getObjectByName("CoinLogo");

      coinLogo.traverse((m) => {
        if (m.isMesh) {
          // Handle Fill mesh - keep as solid
          if (m.name === "Fill") {
            m.material = new THREE.MeshBasicMaterial({
              color: 0x5c2e25,
              transparent: true,
              opacity: 0,
              side: THREE.FrontSide,
              depthWrite: true,
              depthTest: true,
            });
            m.renderOrder = 0; // Render first
            return;
          }

          // For all other meshes, create wireframe edges
          const edges = new THREE.EdgesGeometry(m.geometry, 40);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({
              color: 0xf7f0ed,
              transparent: false,
              opacity: 1,
              depthTest: true,
              depthWrite: true,
            })
          );
          line.renderOrder = 1;
          m.add(line);

          // Invisible fill for non-Fill meshes
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

      // The GLB loads async and the triggers are built here, possibly before
      // layout has fully settled. Re-measure now that they exist.
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
  );
}

// === Init Jar Scene (Sections 2 + 3) ===
function initJarScene() {
  const canvas = document.getElementById("jar-canvas");

  jarScene = new THREE.Scene();
  jarScene.background = null;

  // OrthographicCamera to eliminate perspective distortion
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
    "https://cdn.jsdelivr.net/gh/kevindakin/penny-jar@v1.08/jar_rev.glb",
    (gltf) => {
      // Get both the Jar and Coins groups
      jar = gltf.scene.getObjectByName("Jar");
      const coins = gltf.scene.getObjectByName("Coins_Instance");

      // Position and scale coins to fit inside the jar
      if (coins) {
        coins.position.set(-10, 60, 0);
        coins.scale.set(0.62, 0.62, 0.62);
        coins.rotation.set(0, 0, 0);
      }

      // Process jar meshes
      jar.traverse((m) => {
        if (m.isMesh) {
          const edges = new THREE.EdgesGeometry(m.geometry, 40);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({
              color: 0xf7f0ed,
              opacity: 1,
              transparent: false,
              depthTest: true,
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

      // Process coin meshes (the coins sitting inside the jar)
      if (coins) {
        coins.traverse((m) => {
          if (m.isMesh) {
            if (m.name && m.name.toLowerCase().includes("fill")) {
              m.material = new THREE.MeshBasicMaterial({
                color: 0x5c2e25,
                transparent: false,
                opacity: 1,
                side: THREE.FrontSide,
                depthWrite: true,
                depthTest: true,
              });
              m.renderOrder = 0;
              return;
            }

            const edges = new THREE.EdgesGeometry(m.geometry, 40);
            const line = new THREE.LineSegments(
              edges,
              new THREE.LineBasicMaterial({
                color: 0xf7f0ed,
                opacity: 0.6,
                transparent: false,
                depthTest: true,
                depthWrite: true,
              })
            );
            line.renderOrder = 1;
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

        jar.add(coins);
      }

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
        // Mobile: fade out jar + coin over the centered section (unchanged)
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
      }
      // Desktop/tablet: the jar stays put — no corner move, no scale.
      // (The homepage moved it to the bottom-left and scaled it up during
      // testimonials; that's intentionally gone here.) The jar rests at its
      // init position (0, -275, scale 1.5) and the centered section scrolls
      // over it.
    }
  );
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
  // Find and set the Fill mesh to start transparent with dark copper color
  let fillMesh = null;
  coinLogo.traverse((m) => {
    if (m.name === "Fill" && m.isMesh) {
      fillMesh = m;
      m.material.color.setHex(0x5c2e25);
      m.material.transparent = true;
      m.material.opacity = 0;
    }
  });

  gsap.to(coinLogo.position, {
    x: -8,
    y: FINAL_COIN_Y,
    scrollTrigger: {
      trigger: ".hero_home_section",
      start: "top top",
      endTrigger: INTRO_SECTION,
      end: "bottom top",
      scrub: true,
      onUpdate: renderCoin,
    },
  });

  gsap.to(coinLogo.rotation, {
    x: Math.PI * 0.52,
    y: Math.PI * 2.1,
    scrollTrigger: {
      trigger: ".hero_home_section",
      start: "top top",
      endTrigger: INTRO_SECTION,
      end: "bottom top",
      scrub: true,
      onUpdate: renderCoin,
    },
  });

  gsap.to(coinLogo.scale, {
    x: 0.47,
    y: 0.47,
    z: 0.47,
    scrollTrigger: {
      trigger: ".hero_home_section",
      start: "top top",
      endTrigger: INTRO_SECTION,
      end: "bottom top",
      scrub: true,
      onUpdate: renderCoin,
    },
  });

  // Fill fades in across the full flip distance (same span as above)
  if (fillMesh) {
    gsap.to(fillMesh.material, {
      opacity: 1,
      scrollTrigger: {
        trigger: ".hero_home_section",
        start: "top top",
        endTrigger: INTRO_SECTION,
        end: "bottom top",
        scrub: true,
        onUpdate: renderCoin,
        onComplete: () => {
          fillMesh.material.transparent = false;
          renderCoin();
        },
      },
    });
  }
}

// === Resize handler (orthographic-aware) ===
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

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
}