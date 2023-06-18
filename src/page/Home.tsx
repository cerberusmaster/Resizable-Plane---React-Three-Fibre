import React, { useContext, useEffect, useRef, useState } from "react"
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three";
import { useDrag } from "react-use-gesture";
import { Sky, CameraControls, OrbitControls, CycleRaycast, useCamera } from "@react-three/drei";
import { UIContextProvider, UIContext, ContextValueType } from "../context/UIContextProvider";

let pointA = { x: 3, z: 3 };
let pointB = { x: -3, z: -3 };
let s: THREE.Vector3;
let positions: THREE.Vector3[] = []

const Home = () => {
    const { handlerSelected } = useContext<ContextValueType>(UIContext);
    return <div className='webgl'>
        <Canvas camera={{ position: [0, 10, 0] }} style={{ width: '100vw', height: '100vh' }}>
            {/* <CameraControls makeDefault enabled={!handlerSelected} /> */}
            <OrbitControls enabled={handlerSelected === -1}></OrbitControls>
            <ambientLight />
            {/* <gridHelper args={[20, 20, `#555`, `gray`]} /> */}
            <Rectangle />
            {/* <mesh position={[3, 0, 0]} scale={[0.1, 0.1, 0.1]}>
                <sphereGeometry attach={'geometry'}></sphereGeometry>
                <meshStandardMaterial color={'yellow'}></meshStandardMaterial>
            </mesh> */}
            <CameraDolly></CameraDolly>
        </Canvas >
    </div>
}

const CameraDolly = () => {
    const vec = new THREE.Vector3();
    const { camera } = useThree();

    useFrame((state, delta) => {
        // const step = 0.05
        // const x = 0
        // const y = 10
        // const z = 0

        // state.camera.position.lerp(vec.set(x, y, z), step)
        // state.camera.lookAt(0, 0, 0)
        // state.camera.updateProjectionMatrix()
    })
    useEffect(() => {
        // camera.lookAt(0, 0, 0)
        // camera.updateProjectionMatrix()
    }, [])

    return null
}

const Rectangle = () => {
    const { handlerSelected, setHandlerSelected } = useContext<ContextValueType>(UIContext);

    const [position1, setPosition1] = useState(new THREE.Vector3(pointA.x, 0, pointA.z));
    const [position2, setPosition2] = useState(new THREE.Vector3(pointA.x, 0, pointB.z));
    const [position3, setPosition3] = useState(new THREE.Vector3(pointB.x, 0, pointB.z));
    const [position4, setPosition4] = useState(new THREE.Vector3(pointB.x, 0, pointA.z));

    // Create a plane geometry using the 4 positions
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        position1.x, position1.y, position1.z,
        position2.x, position2.y, position2.z,
        position3.x, position3.y, position3.z,
        position4.x, position4.y, position4.z,
    ]);
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();
    var material = new THREE.MeshBasicMaterial({ color: 0x5aa, side: THREE.DoubleSide });

    const board = useRef<THREE.Mesh>(null);

    const onPointerDownHandler = (e: any, no: number) => {
        setHandlerSelected && setHandlerSelected(no);
        e.target?.setPointerCapture(e.pointerId);
    }
    const onPointerUpHandler = (e: any) => {
        setHandlerSelected && setHandlerSelected(-1);
        e.target?.releasePointerCapture(e.pointerId)
    }

    const [rotation, setRotation] = useState(0);
    const rect = useRef<THREE.Mesh>(null);

    const pos = (P: THREE.Vector3, A: THREE.Vector3, B: THREE.Vector3) => {
        let directAP = P.clone().sub(A);
        const directAB = B.clone().sub(A);
        const angle = directAP.angleTo(directAB);
        const d = Math.cos(angle) * P.distanceTo(A);
        const _direct34 = directAB.normalize().multiplyScalar(d);
        return A.clone().add(_direct34);
    }

    const rot = (pos: THREE.Vector3, middle: THREE.Vector3, angle: number) => {
        const pos1 = pos.clone().sub(middle);
        const _new = new THREE.Vector3(Math.cos(angle) * pos1.x - Math.sin(angle) * pos1.z, 0, Math.sin(angle) * pos1.x + Math.cos(angle) * pos1.z);
        return _new.add(middle);
    }

    const isRight = (dot1: THREE.Vector3, dot2: THREE.Vector3) => {
        var dot = dot1.x * -dot2.z + dot1.z * dot2.x;
        if (dot > 0)
            return 1;
        else if (dot < 0)
            return -1;
        return 1; // parallel
    }

    return (
        <group>
            <mesh ref={board} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1000, 1000, 1]} onPointerMove={(e: any) => { }}>
                <planeGeometry attach={'geometry'}></planeGeometry>
                <meshStandardMaterial color={'#fff'}></meshStandardMaterial>
            </mesh>
            <mesh ref={rect} geometry={geometry} position={[0, 0.01, 0]} scale={[1, 1, 1]} material={material}></mesh>
            <mesh position={position1} scale={[0.3, 0.1, 0.3]}
                onPointerDown={(e) => onPointerDownHandler(e, 1)}
                onPointerMove={(e: any) => {
                    if (handlerSelected === 1) {
                        // e.stopPropagation();
                        const hitBoard = e.intersections?.find((intersect: any) => intersect.object.uuid === board.current?.uuid)
                        if (!!hitBoard) {
                            const hitPoint = new THREE.Vector3(hitBoard.point.x, hitBoard.point.y, hitBoard.point.z);
                            const P = hitPoint.clone();
                            const A = position3.clone();
                            const B = position4.clone();
                            const D = position2.clone();
                            setPosition1(hitPoint);
                            setPosition4(pos(P, A, B));
                            setPosition2(pos(P, A, D));
                        }
                    }
                }}
                onPointerUp={onPointerUpHandler}>
                <boxGeometry attach={"geometry"}></boxGeometry>
                <meshStandardMaterial color="#0fa" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={position2} scale={[0.3, 0.1, 0.3]}
                onPointerDown={(e) => onPointerDownHandler(e, 2)}
                onPointerMove={(e: any) => {
                    if (handlerSelected === 2) {
                        const hitBoard = e.intersections?.find((intersect: any) => intersect.object.uuid === board.current?.uuid)
                        if (!!hitBoard) {
                            const hitPoint = new THREE.Vector3(hitBoard.point.x, hitBoard.point.y, hitBoard.point.z);
                            const P = hitPoint.clone();
                            const A = position4.clone();
                            const B = position1.clone();
                            const D = position3.clone();
                            setPosition2(hitPoint);
                            setPosition1(pos(P, A, B));
                            setPosition3(pos(P, A, D));
                        }
                    }
                }}
                onPointerUp={onPointerUpHandler}>
                <boxGeometry attach={"geometry"}></boxGeometry>
                <meshStandardMaterial color="#0fa" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={position3} scale={[0.3, 0.1, 0.3]}
                onPointerDown={(e) => onPointerDownHandler(e, 3)}
                onPointerMove={(e: any) => {
                    if (handlerSelected === 3) {
                        const hitBoard = e.intersections?.find((intersect: any) => intersect.object.uuid === board.current?.uuid)
                        if (!!hitBoard) {
                            const hitPoint = new THREE.Vector3(hitBoard.point.x, hitBoard.point.y, hitBoard.point.z);
                            const P = hitPoint.clone();
                            const A = position1.clone();
                            const B = position4.clone();
                            const D = position2.clone();
                            setPosition3(hitPoint);
                            setPosition4(pos(P, A, B));
                            setPosition2(pos(P, A, D));
                        }
                    }
                }}
                onPointerUp={onPointerUpHandler}>
                <boxGeometry attach={"geometry"}></boxGeometry>
                <meshStandardMaterial color="#0fa" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={position4} scale={[0.3, 0.1, 0.3]}
                onPointerDown={(e) => onPointerDownHandler(e, 4)}
                onPointerMove={(e: any) => {
                    if (handlerSelected === 4) {
                        const hitBoard = e.intersections?.find((intersect: any) => intersect.object.uuid === board.current?.uuid)
                        if (!!hitBoard) {
                            const hitPoint = new THREE.Vector3(hitBoard.point.x, hitBoard.point.y, hitBoard.point.z);
                            const P = hitPoint.clone();
                            const A = position2.clone();
                            const B = position1.clone();
                            const D = position3.clone();
                            setPosition4(hitPoint);
                            setPosition1(pos(P, A, B));
                            setPosition3(pos(P, A, D));
                        }
                    }
                }}
                onPointerUp={onPointerUpHandler}>
                <boxGeometry attach={"geometry"}></boxGeometry>
                <meshStandardMaterial color="#0fa" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={[(position2.x + position3.x) / 2, 0, (position2.z + position3.z) / 2]} scale={[0.2, 0.2, 0.2]} rotation={[Math.PI * 0.5, 0, 0]}
                onPointerDown={(e) => {
                    onPointerDownHandler(e, 5);
                    const hitBoard = e.intersections?.find((intersect: any) => intersect.object.uuid === board.current?.uuid);
                    if (!!hitBoard) {
                        s = new THREE.Vector3(hitBoard.point.x, hitBoard.point.y, hitBoard.point.z);
                        const _middle = new THREE.Vector3((position1.x + position3.x) / 2, (position1.y + position3.y) / 2, (position1.z + position3.z) / 2);
                        s.sub(_middle);
                        positions = [position1, position2, position3, position4];
                        const { clientX, screenX, offsetX, pageX, movementX } = e;
                        // console.log(clientX, screenX, offsetX, pageX, movementX);
                    }
                }}
                onPointerMove={(e: any) => {
                    const { clientX, screenX, offsetX, pageX, movementX } = e
                    // console.log(clientX, screenX, offsetX, pageX, movementX);
                    if (handlerSelected === 5) {
                        const hitBoard = e.intersections?.find((intersect: any) => intersect.object.uuid === board.current?.uuid)
                        if (!!hitBoard) {
                            let _s = new THREE.Vector3(hitBoard.point.x, hitBoard.point.y, hitBoard.point.z);
                            const _middle = new THREE.Vector3((positions[0].x + positions[2].x) / 2, 0, (positions[0].z + positions[2].z) / 2);
                            _s.sub(_middle);
                            const angle = _s.angleTo(s);
                            const A = _s.clone().normalize();
                            const B = s.clone().normalize();
                            const isR = isRight(A, B);
                            // s = _s;
                            setPosition1(rot(positions[0], _middle, isR * angle));
                            setPosition2(rot(positions[1], _middle, isR * angle));
                            setPosition3(rot(positions[2], _middle, isR * angle));
                            setPosition4(rot(positions[3], _middle, isR * angle));
                        }
                    }
                }}
                onPointerUp={onPointerUpHandler}>
                <torusGeometry attach={"geometry"} args={[1, 0.6, 4, 20]} ></torusGeometry>
                <meshStandardMaterial color="#0fa" metalness={0.5} roughness={0.5} />
            </mesh>
        </group >
    )
}

export default Home;