// import React from 'react'
import { useState } from 'react'

function TagsInput() {
  const [tags, setTags] = useState([])

  function handleKeyDown(e){
    if(e.key !== 'Enter') return
    const value = e.target.value.toUpperCase()
    if(!value.trim()) return

    if (!tags.includes(value)){
        setTags([...tags, value])
    }
    e.target.value = ''
  }

  function handleCheckBox(e){
    const value = e.target.value
    if (!tags.includes(value)){
      setTags([...tags, value])
    }
  }

  function removeTag(index){
    setTags(tags.filter((el, i) => i !== index))
  }

  return (
    <div className='WS-container'>
      <div className='tags-checkbox'>
        <label>
          <input type='checkbox' value='NONE' onChange={handleCheckBox}/>
          NONE
        </label>
        <label>
          <input type='checkbox' value='HAHO' onChange={handleCheckBox}/>
          HAHO
        </label>
        
      </div>

      <div className='tags-input-container'>
        {/* <div className='tag-item'>
            <span className='text'>hello</span>
            <span className='close'>&times;</span>
        </div> */}
        { tags.map((tag, index)=>(
            <div className='tag-item' key={index}>
                <span className='text'>{tag}</span>
                <span className='close' onClick={() => removeTag(index)}>&times;</span>
            </div>
        ))}
        <input onKeyDown={handleKeyDown} type='text' className='tags-input' placeholder='Manual input a workstation'></input>
      </div>
      
    </div>
    
  )
}

export default TagsInput