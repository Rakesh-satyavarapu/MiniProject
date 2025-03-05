import React, { useEffect, useState } from 'react'
import axios from 'axios'
const AllMails = () => {

  const [posts,setPosts]=useState([])

  const getMails = async () =>
    {
        const response = await axios.get('/allMailUploads')
        setPosts(response.data.posts)
    }

  useEffect(()=>{getMails()},[])
  return (
      <>
      {posts.map((post)=>{
      return (
        <div className='card m-3 row'>
          <div className='col-md-6 m-3 '>
              <h1>{post.name}</h1>
              <p>{post.Mailcontent}</p>
          </div>
        </div>)
    })}
      </>
  )
}

export default AllMails
