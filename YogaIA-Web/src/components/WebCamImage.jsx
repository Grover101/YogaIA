import React, { useCallback, useRef, useState } from 'react'
import Webcam from 'react-webcam'

function WebcamImage() {
    const [img, setImg] = useState(null)
    const webcamRef = useRef(null)

    const videoConstraints = {
        width: 420,
        height: 420,
        facingMode: 'user'
    }

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot()
        setImg(imageSrc)
    }, [webcamRef])

    return (
        <div className="flex mb-4">
            <div className="w-1/2 text-center ">
                <div className="relative w-full">
                    {img === null ? (
                        <>
                            <Webcam
                                className="m-auto absolute left-0 right-0 "
                                audio={false}
                                mirrored={true}
                                height={400}
                                width={400}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                            />
                            <button
                                className="text-sm transition font-semibold border rounded-lg px-6 py-2 text-primary hover:border-orangeColor hover:bg-transparent text-white border-orangeColor bg-orangeColor z-10 absolute left-0 right-0 w-4/12 top-48 m-auto"
                                onClick={capture}
                            >
                                Capturar Foto
                            </button>
                        </>
                    ) : (
                        <>
                            <img
                                className="m-auto absolute left-0 right-0"
                                src={img}
                                alt="screenshot"
                            />
                            <button
                                className="text-sm transition font-semibold border rounded-lg px-6 py-2 text-primary hover:border-orangeColor hover:bg-transparent text-white border-orangeColor bg-orangeColor z-10 absolute left-0 right-0 w-4/12 top-48 m-auto"
                                onClick={() => setImg(null)}
                            >
                                Volver a Tomar
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="w-2/4 border">formulario</div>
        </div>
    )
}

export default WebcamImage
