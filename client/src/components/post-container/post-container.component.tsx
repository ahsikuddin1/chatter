import React, { useState, useContext } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useHistory } from 'react-router-dom';

import './post-container.styles.scss';
import { ReactComponent as EditIcon } from '../../assets/edit.svg';
import { ReactComponent as DeleteIcon } from '../../assets/delete.svg';
import { UserContext } from '../../contexts/user.context';
import convertDate from '../../services/convertDate';
import { createComment, editComment } from '../../services/comments';
import { editPost } from '../../services/posts';
import { createLike, deleteLike } from '../../services/likes';
import { isLiked } from '../../services/isLiked';
import { Post } from '../../types';
import ButtonBar from '../button-bar/button-bar.component';

const PostContainer: React.FC<Post | any> = props => {
  const { user, setUser } = useContext(UserContext);
  const [commenting, setCommenting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState(props.content);
  const [input, setInput] = useState('');
  const [post, setPost] = useState(props);
  const { push } = useHistory();

  const {
    name,
    username,
    created_at,
    content,
    id,
    comments,
    subcomments,
    user_id,
    handleDelete
  } = post;

  const { liked, like } = isLiked(user, id);

  const handleEditChange = (e: React.ChangeEvent) => {
    const { value } = e.target as HTMLTextAreaElement;
    setEdit(value);
  };

  const handleLike = async () => {
    let postId = null;
    let commentId = null;

    if (comments) {
      postId = id;
    } else {
      commentId = id;
    }

    if (liked) {
      await deleteLike(like.id);
      setUser({
        ...user,
        likes: user.likes.filter((item: any) => item.id !== like.id)
      });
    } else {
      const likeData = {
        user_id: user.id,
        post_id: postId,
        comment_id: commentId
      };
      await createLike(likeData);
      setUser({
        ...user,
        likes: [...user.likes, likeData]
      });
    }
  };

  const toggleCommenting = () => {
    setCommenting(!commenting);
  };

  const handleChange = (e: React.ChangeEvent) => {
    const { value } = e.target as HTMLTextAreaElement;
    setInput(value);
  };

  const viewPost = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLDivElement) {
      if (comments) {
        push(`/posts/${id}`);
      } else {
        push(`/comments/${id}`);
      }
    }
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    const { id: user_id, username, name } = user;

    let parent_id = 0;
    let post_id = props.id;

    if (props.post_id) {
      post_id = props.post_id;
    }

    if (!comments) {
      parent_id = id;
    }

    await createComment({
      post_id,
      user_id,
      username,
      name,
      content: input,
      parent_id
    });

    setInput('');
    setCommenting(false);
  };

  const handleClick = () => {
    if (comments) {
      handleDelete(id, false);
    } else {
      handleDelete(id, true);
    }
  };

  const handleEditSubmit = async (e: React.MouseEvent) => {
    if (comments) {
      const response = await editPost(id, edit);
      setEditing(false);
      setPost(response);
      console.log(response);
    } else {
      const response = await editComment(id, edit);
      setEditing(false);
      setPost(response);
      console.log(response);
    }
  };

  const toggleEdit = () => {
    setEditing(!editing);
  };

  return (
    <div className='post'>
      <div className='main' onClick={e => viewPost(e)}>
        <div className='details'>
          <span className='name'>{name}</span>
          <span className='username'>@{username}</span>
          <span className='time'>· {convertDate(created_at).timePassed}</span>
          {user && user.id === user_id && (
            <span className='edit-buttons'>
              <EditIcon className='edit-button' onClick={toggleEdit} />
              <DeleteIcon className='edit-button' onClick={handleClick} />
            </span>
          )}
        </div>
        <div className='content'>{content}</div>
        <ButtonBar
          toggleCommenting={toggleCommenting}
          comments={
            (comments && comments.length) || (subcomments && subcomments.length)
          }
          handleLike={handleLike}
          heartFilled={liked}
        />
      </div>
      {editing && (
        <div className='commenting'>
          <TextareaAutosize
            className='comment-text'
            value={edit}
            onChange={handleEditChange}
          />
          <button onClick={handleEditSubmit}>Edit</button>
        </div>
      )}
      {commenting && (
        <div className='commenting'>
          <TextareaAutosize
            className='comment-text'
            value={input}
            onChange={handleChange}
            placeholder='Your turn'
          />
          <button onClick={handleSubmit}>Reply</button>
        </div>
      )}
    </div>
  );
};

export default PostContainer;
