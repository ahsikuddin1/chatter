Rails.application.routes.draw do
  resources :hashtags
  resources :notifications
  resources :reposts
  resources :follows
  resources :posts 
  resources :comments
  resources :users
  resources :likes
  resources :post_hashtags

  post '/auth/login', to: 'authentication#login'
  get '/auth/verify', to: 'authentication#verify'
end
