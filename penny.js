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
              depthWrite: true, // CHANGED: write to depth buffer
            })
          );
          line.renderOrder = 1; // ADDED: render after fill
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
    "https://cdn.jsdelivr.net/gh/kevindakin/penny-jar@v1.08/jar_rev.glb",
    (gltf) => {
      // Get both the Jar and Coins groups
      jar = gltf.scene.getObjectByName("Jar");
      const coins = gltf.scene.getObjectByName("Coins_Instance");

      // Position and scale coins to fit inside the jar
      if (coins) {
        coins.position.set(-10, 60, 0); // Match jar position
        coins.scale.set(0.62, 0.62, 0.62); // Scale down (adjust as needed)
        coins.rotation.set(0, 0, 0); // Reset rotation if needed
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
              transparent: false, // Changed from true
              depthTest: true, // Changed from false
              depthWrite: false,
            })
          );
          line.renderOrder = 999; // Can probably remove this now
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

      // Process coin meshes
      if (coins) {
        coins.traverse((m) => {
          if (m.isMesh) {
            // Check if this is a Fill mesh (check for "Fill" anywhere in the name)
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

            // Create wireframe edges for coin rim/logo
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

            // Invisible fill for original mesh
            m.material = new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 0,
              depthWrite: false,
              depthTest: false,
              colorWrite: false,
            });
          }
        });

        // Add coins to jar so they transform together
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
        m.material.transparent = true; // CRITICAL: Make it transparent first
        gsap.to(m.material, {
          opacity: 0,
          duration: 0.8,
          onUpdate: renderJar,
        });
      }
      // Fade out the fill as well
      if (m.name === "Fill" && m.isMesh) {
        m.material.transparent = true;
        gsap.to(m.material, {
          opacity: 0,
          duration: 0.8,
          onUpdate: renderJar,
        });
      }
    });

    // Remove the coin after fade completes
    gsap.delayedCall(0.8, () => {
      jar.remove(lastCoin);
    });
  }

  const newCoin = coinLogo.clone(true);
  newCoin.traverse((m) => {
    if (m.isMesh || m.isLine) {
      m.material = m.material.clone();
      if (m.isLine) {
        m.material.depthTest = true;
      }
    }
    // Set fill color and proper settings for dropped coins
    if (m.name === "Fill" && m.isMesh) {
      m.material.color.setHex(0x5c2e25);
      m.material.side = THREE.FrontSide;
      m.material.depthWrite = true;
      m.material.depthTest = true;
      m.material.transparent = false;
      m.material.opacity = 1;
      m.renderOrder = 0;
    }
  });

  newCoin.position.set((Math.random() - 0.5) * 50, 400, 0);
  newCoin.rotation.set(0, 0, 0);
  newCoin.scale.set(0.4, 0.4, 0.4);

  jar.add(newCoin);
  droppedCoins.push(newCoin);

  gsap.to(newCoin.position, {
    x: -30,
    y: 173,
    duration: 2,
    ease: "bounce.out",
    onUpdate: renderJar,
  });

  gsap.to(newCoin.rotation, {
    x: Math.PI * 2.48,
    y: Math.PI * 2.06,
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
        m.material.transparent = true; // CRITICAL: Make it transparent first
        gsap.to(m.material, {
          opacity: 0,
          duration: 0.3,
          onUpdate: renderJar,
        });
      }
      // Also fade out fills when clearing
      if (m.name === "Fill" && m.isMesh) {
        m.material.transparent = true;
        gsap.to(m.material, {
          opacity: 0,
          duration: 0.3,
          onUpdate: renderJar,
        });
      }
    });

    // Remove coin after fade completes
    gsap.delayedCall(0.3, () => {
      jar.remove(coin);
    });
  });
  droppedCoins.length = 0;
}

// === Hook into testimonials swiper (desktop only) ===
function initSwiperDrops(swiper, wrapper) {
  if (window.innerWidth < 992) {
    return;
  }

  let isVisible = false;
  let isDropping = false; // Prevent multiple drops

  // Set up Intersection Observer to track visibility
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
      });
    },
    {
      threshold: 0.3,
    }
  );

  // Observe the testimonials section
  const testimonialsSection = document.querySelector(
    ".home_testimonials_section"
  );
  if (testimonialsSection) {
    observer.observe(testimonialsSection);
  }

  // Drop coin on slide change, but only if section is visible and not already dropping
  setTimeout(() => {
    swiper.on("slideChange", () => {
      if (coinLogo && isVisible && !isDropping) {
        isDropping = true;
        dropCoin();

        // Reset the flag after the animation duration (2 seconds)
        setTimeout(() => {
          isDropping = false;
        }, 2000);
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
    y: -25,
    scrollTrigger: {
      trigger: ".hero_home_section",
      start: "top top",
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
      end: "bottom top",
      scrub: true,
      onUpdate: renderCoin,
    },
  });

  // Animate the Fill opacity during scroll
  if (fillMesh) {
    gsap.to(fillMesh.material, {
      opacity: 1,
      scrollTrigger: {
        trigger: ".hero_home_section",
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: renderCoin,
        onComplete: () => {
          // Once fully faded in, make it completely opaque
          fillMesh.material.transparent = false;
          renderCoin();
        },
      },
    });
  }

  if (window.innerWidth > 991) {
    gsap.fromTo(
      coinLogo.position,
      { x: -8, y: -25 },
      {
        x: -370,
        y: -134,
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