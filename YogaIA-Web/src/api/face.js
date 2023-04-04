import * as faceapi from 'face-api.js'

const maxDescriptorDistance = 0.5

export async function loadModels() {
    const MODEL_URL = '/models'
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
    await faceapi.loadFaceLandmarkTinyModel(MODEL_URL)
    await faceapi.loadFaceRecognitionModel(MODEL_URL)
}

export async function getFullFaceDescription(blob, inputSize = 512) {
    const scoreThreshold = 0.5
    const OPTION = new faceapi.TinyFaceDetectorOptions({
        inputSize,
        scoreThreshold
    })
    const useTinyModel = true
    const img = await faceapi.fetchImage(blob)
    const fullDesc = await faceapi
        .detectAllFaces(img, OPTION)
        .withFaceLandmarks(useTinyModel)
        .withFaceDescriptors()
    return fullDesc
}

export async function createMatcher(faceProfile) {
    const members = Object.keys(faceProfile)
    const labeledDescriptors = members.map(
        member =>
            new faceapi.LabeledFaceDescriptors(
                faceProfile[member].name,
                faceProfile[member].descriptors.map(
                    descriptor => new Float32Array(descriptor)
                )
            )
    )

    const faceMatcher = new faceapi.FaceMatcher(
        labeledDescriptors,
        maxDescriptorDistance
    )
    return faceMatcher
}

export function isFaceDetectionModelLoaded() {
    return !!faceapi.nets.tinyFaceDetector.params
}
