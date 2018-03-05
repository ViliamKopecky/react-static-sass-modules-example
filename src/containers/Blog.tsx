import React from 'react'
import { withRouteData, Link } from 'react-static'
import { Post } from '../types'

import * as styles from './blog.module.sass'

interface Props {
  posts: Post[]
}

export default withRouteData(({ posts }: Props) => (
  <div className={styles.container + ' container'}>
    <h1>It's blog time.</h1>
    <br />
    All Posts:
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <Link to={`/blog/post/${post.id}/`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  </div>
))
