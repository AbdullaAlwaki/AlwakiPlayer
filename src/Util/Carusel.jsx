import React from 'react'
import "../Style/Carusel.scss"

export default function Carusel({index, backdropImg}) {
  return (
    <div className="carusel_container">
    <div
      className="carusel"
      style={{ transform: `translateX(-${index * 100}%)` }}
    >
      {backdropImg.map((img, index) => (
        <div
          key={index}
          className="carusel_item"
          style={{ backgroundImage: `url(${img})` }}
        ></div>
      ))}
    </div>
  </div>
  )
}
