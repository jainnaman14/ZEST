import React from 'react'

function CategoryCard({ name, image, onClick }) {
  return (
    <button className='w-[132px] h-[150px] md:w-[190px] md:h-[210px] rounded-3xl border border-lime-100 shrink-0 overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative text-left' onClick={onClick}>
      <img src={image} alt={name} className='w-full h-full object-cover transform hover:scale-105 transition-transform duration-300' />
      <div className='absolute inset-x-2 bottom-2 bg-white/90 px-3 py-2 rounded-2xl text-center shadow-sm text-sm font-bold text-slate-900 backdrop-blur'>
        {name}
      </div>
    </button>
  )
}

export default CategoryCard