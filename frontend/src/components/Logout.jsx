import React from 'react'
import axios from 'axios'
const Logout = () => {
    const out = async() =>{
        await axios.get('/logout')
    }
  return (  
    <>
    <button onClick={out}>logout</button>
    </>
  )
}

export default Logout
