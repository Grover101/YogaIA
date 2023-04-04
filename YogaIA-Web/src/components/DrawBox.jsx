import React, { useEffect, useState } from 'react'

export const DrawBox = ({ fullDesc, faceMatcher, imageWidth }) => {
    const [detections, setDetections] = useState(null)
    const [match, setMatch] = useState(null)

    useEffect(() => {
        const descriptors = fullDesc.map(fd => fd.descriptor)
        setDetections(fullDesc.map(fd => fd.detection))
        setMatch(
            descriptors.map(descriptor => faceMatcher.findBestMatch(descriptor))
        )
    }, [fullDesc, faceMatcher])

    return detections
        ? detections.map((detection, i) => {
              const relativeBox = detection.relativeBox
              const dimension = detection._imageDims
              const _X = imageWidth * relativeBox._x
              const _Y =
                  (relativeBox._y * imageWidth * dimension._height) /
                  dimension._width
              const _W = imageWidth * relativeBox.width
              const _H =
                  (relativeBox.height * imageWidth * dimension._height) /
                  dimension._width

              return (
                  <div key={i}>
                      <div
                          className={`absolute border-4 ${
                              match && match[i] && match[i]._label !== 'unknown'
                                  ? 'border-orangeColor'
                                  : 'border-[#FF0000]'
                          }`}
                          style={{
                              height: _H,
                              width: _W,
                              transform: `translate(${_X}px,${_Y}px)`
                          }}
                      >
                          {match &&
                          match[i] &&
                          match[i]._label !== 'unknown' ? (
                              <p
                                  className="bg-orangeColor mt-0 text-white p-1 font-bold"
                                  style={{
                                      width: _W,
                                      transform: `translate(-3px,${_H}px)`
                                  }}
                              >
                                  {match[i]._label}
                              </p>
                          ) : (
                              <p
                                  className="bg-[#FF0000] mt-0 text-white p-1 font-bold"
                                  style={{
                                      width: _W,
                                      transform: `translate(-3px,${_H}px)`
                                  }}
                              >
                                  Desconocido
                              </p>
                          )}
                      </div>
                  </div>
              )
          })
        : null
}
