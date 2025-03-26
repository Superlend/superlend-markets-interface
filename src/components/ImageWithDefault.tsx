import React, { useState } from 'react'
import Image, { ImageProps } from 'next/image'

const ImageWithDefault = (props: ImageProps) => {
  const [error, setError] = useState(false)
  const fallbackSrc = '/images/placeholder.png' // You can change this to your default image

  return (
    <Image
      {...props}
      src={error ? fallbackSrc : props.src}
      onError={() => setError(true)}
      alt={props.alt || 'Image'}
    />
  )
}

export default ImageWithDefault 