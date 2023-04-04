import { useCallback, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { loadModels, getFullFaceDescription } from './../../api/face'
import { fetchAPI } from '../../helpers/fetch'
import { DataURIToBlob } from '../../helpers/validation'
import { DrawBox } from './../DrawBox'

const WIDTH = 420
const HEIGHT = 420
const inputSize = 160

export const CameraFaceDetect = () => {
    const [fullDesc, setFullDesc] = useState(null)
    const [user, setUser] = useState(null)

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
        return () => clearInterval(id)
    }, [])

    const confirmation = () => {
        // confirmar usuario autenticado
    }

    const capture = useCallback(async () => {
        const imageSrc = webcam.current.getScreenshot()
        const file = DataURIToBlob(imageSrc)
        const formData = new FormData()
        formData.append('photo', file)
        const message = await fetchAPI(formData, '/users/verify')
        setUser(message)
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
                            info={user}
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
