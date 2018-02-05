Rails.application.routes.draw do
  root to: 'pages#home'

  resources :artists do
    resources :songs
  end

  get '/bootstrap', to: 'pages#bootstrap', as: 'bootstrap'

  # API setup
  namespace :api do
    resources :artists do
      resources :songs
    end
  end
end
