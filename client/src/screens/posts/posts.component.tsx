import React, { useState, useContext, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import './posts.styles.scss';

import { Post } from '../../types';
import { deleteComment } from '../../services/comments';
import { deletePost } from '../../services/posts';
import { UserContext } from '../../contexts/user.context';
import { createPost, getPosts } from '../../services/posts';
import PostContainer from '../../components/post-container/post-container.component';

const Posts = () => {
  const { user } = useContext(UserContext);
  const [input, setInput] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    const response = await getPosts();
    setPosts(response);
    console.log(response);
  };

  const handleChange = (e: React.ChangeEvent) => {
    const { value } = e.target as HTMLTextAreaElement;

    setInput(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { id, name, username } = user;

    const post = await createPost({
      user_id: id,
      name,
      username,
      content: input
    });

    setPosts([...posts, { ...post, comments: [] }]);
    setInput('');

    console.log(post);
  };

  const handleDelete = async (id: number, isComment: boolean) => {
    if (isComment) {
      await deleteComment(id);
      setPosts(posts.filter(item => item.id !== id));
    } else {
      await deletePost(id);
      setPosts(posts.filter(item => item.id !== id));
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className='home'>
      <header>Posts</header>
      {user && (
        <form onSubmit={handleSubmit}>
          <TextareaAutosize
            className='textarea'
            value={input}
            onChange={handleChange}
            placeholder="What's happening?"
          />
          <div>
            <button>Chirp</button>
          </div>
        </form>
      )}
      {[...posts].reverse().map((post: Post, idx) => (
        <PostContainer key={idx} handleDelete={handleDelete} {...post} />
      ))}
    </div>
  );
};

export default Posts;
