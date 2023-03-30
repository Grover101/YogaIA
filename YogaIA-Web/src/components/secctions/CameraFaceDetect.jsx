import Webcam from 'react-webcam'
import {
    loadModels,
    getFullFaceDescription,
    createMatcher
} from './../../api/face'
import { DrawBox } from './../DrawBox'
import { useCallback, useEffect, useRef, useState } from 'react'

const WIDTH = 420
const HEIGHT = 420
const inputSize = 160

export const CameraFaceDetect = () => {
    const [fullDesc, setFullDesc] = useState(null)
    const [faceMatcher, setFaceMatcher] = useState(null)

    const webcam = useRef(null)
    const videoConstraints = {
        width: WIDTH,
        height: HEIGHT,
        facingMode: 'user'
    }

    useEffect(() => {
        loadModels()
        const id = setInterval(() => {
            capture()
        }, 1500)
        matcher()

        return () => clearInterval(id)
    }, [])

    const matcher = async () => {
        const response = await fetch(
            'http://localhost:3000/api/users/description'
        )
        const data = await response.json()
        const faceMatcher = await createMatcher(data)
        setFaceMatcher(faceMatcher)
    }

    const confirmation = () => {
        // confirmar usuario autenticado
    }

    const capture = useCallback(async () => {
        const fullDescAuxn = await getFullFaceDescription(
            webcam.current.getScreenshot(),
            inputSize
        )
        await setFullDesc(e => fullDescAuxn)
    }, [webcam])

    return (
        <div className="flex flex-col items-center">
            <div
                style={{
                    width: WIDTH,
                    height: HEIGHT
                }}
            >
                <div style={{ position: 'relative', width: WIDTH }}>
                    <div className="absolute">
                        <Webcam
                            audio={false}
                            mirrored={true}
                            width={WIDTH}
                            height={HEIGHT}
                            ref={webcam}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                        />
                    </div>
                    {fullDesc?.length ? (
                        <DrawBox
                            fullDesc={fullDesc}
                            faceMatcher={faceMatcher}
                            imageWidth={WIDTH}
                        />
                    ) : null}
                </div>
            </div>
            <button
                className="text-sm transition font-semibold border rounded-lg px-6 py-2 text-primary hover:border-orangeColor hover:bg-transparent text-white border-orangeColor bg-orangeColor mt-2"
                onClick={confirmation}
            >
                confirmation
            </button>
        </div>
    )
}
