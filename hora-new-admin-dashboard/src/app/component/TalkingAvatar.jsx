// import React, { useRef } from 'react';
// import { useGLTF } from '@react-three/drei';

// const AvatarModel = () => {
//   const modelRef = useRef();
//   const { scene } = useGLTF('/avatar.glb'); // put the .glb file in your public folder

//   return <primitive ref={modelRef} object={scene} scale={1.5} />;
// };

// export default AvatarModel;

// Avatar.jsx

// import React, { useRef, useEffect } from 'react';
// import { useGLTF } from '@react-three/drei';
// import { useFrame } from '@react-three/fiber';

// export default function Avatar({ isSpeaking }) {
//   const { scene } = useGLTF('https://models.readyplayer.me/689471c7397e31dc7d0bc4df.glb');
// //   const { scene } = useGLTF('/avatar.glb'); 
//   const mouthMeshes = useRef([]);

//   useEffect(() => {
//     const targets = [];
//     scene.traverse((child) => {
//       if (
//         child.isMesh &&
//         child.morphTargetDictionary &&
//         'mouthOpen' in child.morphTargetDictionary
//       ) {
//         targets.push({
//           mesh: child,
//           index: child.morphTargetDictionary['mouthOpen'],
//         });
//       }
//     });
//     mouthMeshes.current = targets;
//   }, [scene]);

//   useFrame(() => {
//     mouthMeshes.current.forEach(({ mesh, index }) => {
//       mesh.morphTargetInfluences[index] = isSpeaking
//         ? Math.random() * 0.5 + 0.2
//         : 0;
//     });
//   });

//   return <primitive object={scene} scale={1.3} position={[0, -1.4, 0]} />;
// }

// working
// import React, { useRef, useEffect } from 'react';
// import { useGLTF } from '@react-three/drei';
// import { useFrame } from '@react-three/fiber';
// import * as THREE from 'three';

// export default function Avatar({ isSpeaking }) {
// //   const { scene } = useGLTF('https://models.readyplayer.me/689471c7397e31dc7d0bc4df.glb');
//    const { scene } = useGLTF('/avatar.glb'); 

//   const morphTargets = useRef([]);
//   const bones = useRef({});

//   useEffect(() => {
//     const targets = [];
//     const boneRefs = {};

//     scene.traverse((child) => {
//       // Collect morph target meshes
//       if (child.isMesh && child.morphTargetDictionary) {
//         const dict = child.morphTargetDictionary;
//         const influences = child.morphTargetInfluences;

//         ['mouthOpen', 'mouthSmile', 'eyeBlinkLeft', 'eyeBlinkRight'].forEach((target) => {
//           if (dict[target] !== undefined) {
//             targets.push({
//               mesh: child,
//               index: dict[target],
//               type: target,
//             });
//           }
//         });
//       }

//       // Collect important bones for movement
//       if (child.isBone) {
//         const name = child.name.toLowerCase();
//         if (
//           name.includes('neck') ||
//           name.includes('head') ||
//           name.includes('arm') ||
//           name.includes('hand') ||
//           name.includes('spine')
//         ) {
//           boneRefs[child.name] = child;
//         }
//       }
//     });

//     morphTargets.current = targets;
//     bones.current = boneRefs;
//   }, [scene]);

//   useFrame((state) => {
//     const t = state.clock.getElapsedTime();

//     // Animate facial expressions
//     morphTargets.current.forEach(({ mesh, index, type }) => {
//       let value = 0;
//       if (isSpeaking && type === 'mouthOpen') {
//         value = Math.sin(t * 10) * 0.4 + 0.3;
//       } else if (type === 'mouthSmile') {
//         value = isSpeaking ? 0.4 : 0;
//       } else if (type.includes('eyeBlink')) {
//         value = Math.sin(t * 2) > 0.95 ? 1 : 0;
//       }

//       mesh.morphTargetInfluences[index] = THREE.MathUtils.clamp(value, 0, 1);
//     });

//     // Animate bone movement (head bob, arm sway)
//     if (bones.current['Head']) {
//       bones.current['Head'].rotation.y = Math.sin(t) * 0.2;
//     }
//     if (bones.current['Neck']) {
//       bones.current['Neck'].rotation.x = Math.sin(t) * 0.1;
//     }
//     if (bones.current['mixamorigRightArm']) {
//       bones.current['mixamorigRightArm'].rotation.z = Math.sin(t * 1.5) * 0.2;
//     }
//     if (bones.current['mixamorigLeftArm']) {
//       bones.current['mixamorigLeftArm'].rotation.z = -Math.sin(t * 1.5) * 0.2;
//     }
//     if (bones.current['mixamorigSpine']) {
//       bones.current['mixamorigSpine'].rotation.y = Math.sin(t) * 0.05;
//     }
//   });

//   return <primitive object={scene} scale={1.3} position={[0, -1.4, 0]} />;
// }

// import React, { useRef } from 'react';
// import { useFrame } from '@react-three/fiber';
// import { useGLTF } from '@react-three/drei';
// import * as THREE from 'three';

// export default function Avatar({ isTalking }) {
//   const group = useRef();
//   const { scene, nodes } = useGLTF('https://models.readyplayer.me/689471c7397e31dc7d0bc4df.glb');

//   useFrame(() => {
//     if (!nodes?.Wolf3D_Head?.morphTargetInfluences) return;

//     const head = nodes.Wolf3D_Head;
//     const mouthOpenIndex = head.morphTargetDictionary?.mouthOpen;

//     if (mouthOpenIndex !== undefined) {
//       const influence = head.morphTargetInfluences[mouthOpenIndex];
//       const target = isTalking ? Math.sin(Date.now() * 0.01) * 0.5 + 0.5 : 0;
//       head.morphTargetInfluences[mouthOpenIndex] = THREE.MathUtils.lerp(influence, target, 0.1);
//     }

//     if (group.current) {
//       group.current.rotation.y = isTalking ? Math.sin(Date.now() * 0.002) * 0.1 : 0;
//       group.current.position.y = isTalking ? Math.sin(Date.now() * 0.004) * 0.02 : 0;
//     }
//   });

//   return <primitive ref={group} object={scene} position={[0, -1.5, 0]} scale={2} />;
// }


// // Avatar.jsx
// import React, { useRef, useEffect } from 'react';
// import { useFrame } from '@react-three/fiber';
// import { useGLTF } from '@react-three/drei';
// import * as THREE from 'three';

// export default function Avatar({ isSpeaking }) {
//   const group = useRef();
//   const { scene, nodes } = useGLTF('/avatar.glb');

//   // Automatically find the node with "mouthOpen" morph
//   let morphNode = null;
//   let morphDict = null;
//   let morphInfluences = null;

//   useEffect(() => {
//     Object.entries(nodes).forEach(([name, node]) => {
//       if (node.morphTargetDictionary && node.morphTargetDictionary.mouthOpen !== undefined) {
//         console.log(`✅ Found morphs in node: ${name}`);
//         console.log(node.morphTargetDictionary);
//         morphNode = node;
//         morphDict = node.morphTargetDictionary;
//         morphInfluences = node.morphTargetInfluences;
//       }
//     });

//     if (!morphNode) {
//       console.warn('❌ No morph node with "mouthOpen" found');
//     }
//   }, [nodes]);

//   useFrame(() => {
//     // If morph node is found, animate
//     if (!morphNode || !morphNode.morphTargetDictionary) return;

//     const dict = morphNode.morphTargetDictionary;
//     const influences = morphNode.morphTargetInfluences;

//     // Animate mouthOpen
//     const mouthOpenIndex = dict.mouthOpen;
//     if (mouthOpenIndex !== undefined) {
//       const target = isSpeaking ? 0.7 : 0.05;
//       influences[mouthOpenIndex] = THREE.MathUtils.lerp(influences[mouthOpenIndex], target, 0.1);
//     }

//     // Optional: Animate head movement
//     if (group.current && isSpeaking) {
//       const time = Date.now();
//       group.current.rotation.y = Math.sin(time * 0.002) * 0.1;
//       group.current.position.y = Math.sin(time * 0.002) * 0.03;
//     }
//   });

//   return <primitive ref={group} object={scene} position={[0, -1.5, 0]} scale={2} />;
// }
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function TalkingAvatar({ isTalking }) {
  const group = useRef();
  const { scene, nodes } = useGLTF('/survival_character.glb'); // ensure the path points to your actual file

  useEffect(() => {
    // Reset arms to down posture
    scene.traverse((n) => {
      if (n.isBone && n.name.toLowerCase().includes('arm')) {
        n.rotation.z = -0.8;
      }
    });
  }, [scene]);

  useFrame(() => {
    const t = Date.now() * 0.002;

    // Animate morphs on each relevant mesh
    ['Mesh003', 'Mesh003_1', 'Mesh003_2'].forEach((meshName) => {
      const mesh = nodes[meshName];
      if (!mesh?.morphTargetInfluences || !mesh.morphTargetDictionary) return;

      const inf = mesh.morphTargetInfluences;
      const dict = mesh.morphTargetDictionary;

      // Mouth open/close
      const jawOpen = dict.jawOpen;
      if (jawOpen !== undefined) {
        const target = isTalking ? Math.abs(Math.sin(t * 8)) * 0.7 : 0;
        inf[jawOpen] = THREE.MathUtils.lerp(inf[jawOpen], target, 0.15);
      }

      // Smile when idle
      ['mouthSmileLeft', 'mouthSmileRight'].forEach((key) => {
        const idx = dict[key];
        if (idx !== undefined) {
          const target = isTalking ? 0 : 0.5;
          inf[idx] = THREE.MathUtils.lerp(inf[idx], target, 0.15);
        }
      });

      // Eyebrows raise when speaking
      const browInnerUp = dict.browInnerUp;
      if (browInnerUp !== undefined) {
        const target = isTalking ? 0.3 : 0;
        inf[browInnerUp] = THREE.MathUtils.lerp(inf[browInnerUp], target, 0.1);
      }

      // Eye blinking (random)
      ['eyeBlinkLeft', 'eyeBlinkRight'].forEach((key) => {
        const idx = dict[key];
        if (idx !== undefined) {
          inf[idx] = Math.random() < 0.01 ? 1 : 0;
        }
      });
    });

    // Body/head sway
    if (group.current) {
      group.current.rotation.y = isTalking ? Math.sin(t) * 0.05 : 0;
      group.current.position.y = isTalking ? Math.sin(t * 2) * 0.02 : 0;
    }

    // Arm gesture when talking
    scene.traverse((n) => {
      if (n.isBone && n.name.toLowerCase().includes('arm')) {
        n.rotation.z = isTalking
          ? -0.8 + Math.sin(t * 3) * 0.2
          : n.rotation.z;
      }
    });
  });

  return <primitive ref={group} object={scene} scale={2} position={[0, -1.5, 0]} />;
}



// import React, { useRef, useState } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { OrbitControls, useGLTF, Html } from '@react-three/drei';
// import * as THREE from 'three';

// function Avatar({ isTalking }) {
//   const group = useRef();
//   const { scene, nodes, materials } = useGLTF('https://models.readyplayer.me/689471c7397e31dc7d0bc4df.glb');

//   useFrame(() => {
//     if (!nodes.Wolf3D_Head?.morphTargetInfluences) return;

//     // Animate mouthOpen
//     const head = nodes.Wolf3D_Head;
//     const mouthOpenIndex = head.morphTargetDictionary.mouthOpen;
//     if (mouthOpenIndex !== undefined) {
//       const influence = head.morphTargetInfluences[mouthOpenIndex];
//       const target = isTalking ? Math.sin(Date.now() * 0.01) * 0.5 + 0.5 : 0;
//       head.morphTargetInfluences[mouthOpenIndex] = THREE.MathUtils.lerp(influence, target, 0.1);
//     }

//     // Move body slightly if talking
//     if (group.current) {
//       group.current.rotation.y = isTalking ? Math.sin(Date.now() * 0.002) * 0.1 : 0;
//       group.current.position.y = isTalking ? Math.sin(Date.now() * 0.004) * 0.02 : 0;
//     }
//   });

//   return <primitive ref={group} object={scene} position={[0, -1.5, 0]} scale={2} />;
// }

// export default function AvatarViewer() {
//   const [text, setText] = useState('');
//   const [isTalking, setIsTalking] = useState(false);

//   const handleSpeak = () => {
//     if (!text.trim()) return;
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.onstart = () => setIsTalking(true);
//     utterance.onend = () => setIsTalking(false);
//     speechSynthesis.speak(utterance);
//   };

//   return (
//     <div style={{ width: '100%', height: '100vh' }}>
//       {/* UI Section */}
//       <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1 }}>
//         <input
//           type="text"
//           value={text}
//           placeholder="Type something..."
//           onChange={(e) => setText(e.target.value)}
//           style={{ padding: '8px', fontSize: '16px', marginRight: '8px' }}
//         />
//         <button onClick={handleSpeak} style={{ padding: '8px 16px', fontSize: '16px' }}>
//           Speak
//         </button>
//       </div>

//       {/* 3D Scene */}
//       <Canvas camera={{ position: [0, 1.5, 2.5] }}>
//         <ambientLight intensity={0.7} />
//         <directionalLight position={[0, 5, 5]} intensity={1} />
//         <OrbitControls />
//         <Avatar isTalking={isTalking} />
//       </Canvas>
//     </div>
//   );
// }

