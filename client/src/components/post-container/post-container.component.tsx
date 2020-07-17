import React, { useState, useContext } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Link, useHistory } from 'react-router-dom';

import './post-container.styles.scss';
import { ReactComponent as ShareIcon } from '../../assets/share.svg';
import { ReactComponent as EditIcon } from '../../assets/edit.svg';
import { ReactComponent as DeleteIcon } from '../../assets/delete.svg';
import { UserContext } from '../../contexts/user.context';
import { createComment, editComment } from '../../services/comments';
import { editPost } from '../../services/posts';
import { getInitials } from '../../services/helpers';
import convertDate from '../../services/convertDate';
import { Post } from '../../types';
import ButtonBar from '../button-bar/button-bar.component';

const PostContainer: React.FC<Post> = props => {
  const [post, setPost] = useState(props);
  const { user, setUser } = useContext(UserContext);
  const [commenting, setCommenting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState(props.content);
  const [input, setInput] = useState('');
  const initials = getInitials(post, '');
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
    handleDelete,
    reply_to,
    repost,
    repost_by
  } = post;

  const handleEditChange = (e: React.ChangeEvent) => {
    const { value } = e.target as HTMLTextAreaElement;
    setEdit(value);
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
      } else if (repost) {
        push(`/posts/${post.post_id}`);
      } else {
        push(`/comments/${id}`);
      }
    }
  };

  const handleSubmit = async (e: React.MouseEvent) => {
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
      user_id: user.id,
      username: user.username,
      name: user.name,
      content: input,
      parent_id,
      reply_to: post.username
    });

    setInput('');
    setCommenting(false);
  };

  const handleClick = () => {
    if (comments) {
      handleDelete(id, 1);
    } else if (post.repost) {
      handleDelete(post.id, 2);
    } else {
      handleDelete(id, 3);
    }
  };

  const handleEditSubmit = async (e: React.MouseEvent) => {
    if (comments) {
      const response = await editPost(id, edit);
      setEditing(false);
      setPost(response);
    } else {
      const response = await editComment(id, edit);
      setEditing(false);
      setPost(response);
    }
  };

  const toggleEdit = () => {
    setEditing(!editing);
  };

  return (
    <div className='post'>
      <div className='main' onClick={e => viewPost(e)}>
        <div className={repost ? `repost-info` : `repost-hide`}>
          {repost && (
            <>
              <ShareIcon className='repost-icon' />
              {repost_by} reposted
            </>
          )}
        </div>
        <div className='main-body'>
          <div className='avatar'>{initials}</div>
          <div className='container-body'>
            <div className='details'>
              <Link to={`/users/${username}`}>
                <span className='name'>{name}</span>
              </Link>
              <span className='username'>@{username}</span>
              <span className='time'>
                · {convertDate(created_at).timePassed}
              </span>
              {user && user.id === user_id && (
                <span className='edit-buttons'>
                  <EditIcon className='edit-button' onClick={toggleEdit} />
                  <DeleteIcon className='edit-button' onClick={handleClick} />
                </span>
              )}
            </div>
            <div className='reply-to'>
              {subcomments && `Replying to @` + reply_to}
            </div>
            <div className='content'>{content}</div>
          </div>
        </div>
        <ButtonBar
          toggleCommenting={toggleCommenting}
          comments={
            (comments && comments.length) || (subcomments && subcomments.length)
          }
          {...{ user, post, setUser }}
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
          <button onClick={handleSubmit} disabled={input.length === 0}>
            Reply
          </button>
        </div>
      )}
    </div>
  );
};

export default PostContainer;
