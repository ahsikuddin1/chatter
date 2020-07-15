import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';

import './post.styles.scss';
import { UserContext } from '../../contexts/user.context';
import { Post as PostType } from '../../types';
import { ReactComponent as BackIcon } from '../../assets/back.svg';
import { createLike } from '../../services/likes';
import { getPost, deletePost } from '../../services/posts';
import {
  createComment,
  getComment,
  deleteComment
} from '../../services/comments';
import convertDate from '../../services/convertDate';
import ButtonBar from '../../components/button-bar/button-bar.component';
import PostContainer from '../../components/post-container/post-container.component';
import { isLiked } from '../../services/isLiked';

const Post = () => {
  const [post, setPost] = useState<PostType>({
    created_at: '',
    username: '',
    name: '',
    user_id: 0,
    content: '',
    id: 0,
    comments: [],
    subcomments: []
  });
  const { id, subcomment_id } = useParams();
  const { formattedTime, formattedDate } = convertDate(post.created_at);
  const { pathname } = useLocation();
  const { goBack } = useHistory();
  const { user } = useContext(UserContext);
  const [commenting, setCommenting] = useState(false);
  const [input, setInput] = useState('');

  const { liked, like } = isLiked(user, post.id);

  const fetchPost = async () => {
    let response;

    if (subcomment_id) {
      response = await getComment(subcomment_id);
    } else {
      response = await getPost(id);
    }

    setPost(response);
  };

  const toggleCommenting = () => {
    setCommenting(!commenting);
  };

  const handleDelete = async (id: number, isComment: boolean) => {
    if (isComment) {
      await deleteComment(id);
    } else {
      await deletePost(id);
    }

    fetchPost();
  };

  const handleLike = async () => {
    let postId, commentId;

    if (post.comments) {
      postId = id;
    } else {
      commentId = id;
    }

    const response = await createLike({
      user_id: user.id,
      post_id: postId,
      comment_id: commentId
    });

    console.log(response);
  };

  const handleBack = () => {
    goBack();
  };

  const handleChange = (e: React.ChangeEvent) => {
    const { value } = e.target as HTMLTextAreaElement;
    setInput(value);
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    let parent_id, post_id;

    if (post.comments) {
      parent_id = 0;
      post_id = id;
    } else {
      parent_id = post.id;
      post_id = 0;
    }

    const response = await createComment({
      post_id,
      user_id: user.id,
      username: user.username,
      name: user.name,
      content: input,
      parent_id,
      reply_to: post.username
    });

    if (post.comments) {
      setPost({ ...post, comments: [...post.comments, response] });
    } else {
      setPost({ ...post, subcomments: [...post.subcomments, response] });
    }

    setInput('');
    setCommenting(false);
  };

  useEffect(() => {
    fetchPost();
  }, [pathname]);

  const initialSplit = post.name.split(' ');
  let initials;
  if (initialSplit[1] && initialSplit[1][0]) {
    initials = initialSplit[0][0] + initialSplit[1][0];
  } else {
    initials = initialSplit[0][0];
  }

  return (
    <div className='comments'>
      <header>
        <BackIcon className='icon back-button' onClick={handleBack} />
        Post
      </header>
      <div className='post-head'>
        <div className='post-head-header'>
          <div className='avatar'>{initials}</div>
          <div className='titles'>
            <span className='name'>{post.name}</span>
            <span className='username'>@{post.username}</span>
          </div>
        </div>
        <div className='reply-to'>
          {post.subcomments && `Replying to @` + post.reply_to}
        </div>
        <div className='comments'>{post.content}</div>
        <span className='time'>
          {formattedTime} · {formattedDate}
        </span>
        <ButtonBar
          toggleCommenting={toggleCommenting}
          handleLike={handleLike}
          heartFilled={liked}
        />
      </div>
      {commenting && (
        <div className='commenting'>
          <TextareaAutosize
            className='comment-text'
            value={input}
            onChange={handleChange}
          />
          <button onClick={handleSubmit}>Reply</button>
        </div>
      )}
      <div className='comments-body'>
        {post.comments &&
          post.comments.length > 0 &&
          [...post.comments]
            .sort((a: any, b: any) => +b.id - +a.id)
            .map(
              (comment: any) =>
                !comment.parent_id && (
                  <PostContainer
                    key={comment.id}
                    handleDelete={handleDelete}
                    {...comment}
                  />
                )
            )}
        {post.subcomments &&
          [...post.subcomments]
            .sort((a: any, b: any) => +b.id - +a.id)
            .map((comment: any) => (
              <PostContainer
                key={comment.id}
                handleDelete={handleDelete}
                {...comment}
              />
            ))}
      </div>
    </div>
  );
};

export default Post;
