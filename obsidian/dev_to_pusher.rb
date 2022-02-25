require 'faraday'
require 'faraday/net_http'

require_relative './obsidian_blog_post'

conn = Faraday.new(
    url: 'https://dev.to',
    headers: { 'api-key' => ENV['DEV_TO_API_KEY'] }
  ) do |f|
    f.request :json
    f.response :json
    f.adapter :net_http
  end

# response = conn.get('api/users/me')

post_title = 'Reading a Ruby gem with VSCode'
source_file = "Blog/Published/#{post_title}.md"
OBSIDIAN_DIRECTORY = ENV['OBSIDIAN_DIRECTORY']
article_path = File.join(OBSIDIAN_DIRECTORY, source_file)
obsidian_blog_post = ObsidianBlogPost.from_markdown_file(article_path)

response = conn.post('api/articles') do |req|
  req.body = {
   article: {
      title: obsidian_blog_post.title,
      body_markdown: obsidian_blog_post.to_devto_markdown,
      tags: obsidian_blog_post.tags,
      # series: 'Hello series'
      # canonical_url: "https://wasabigeek.com/",
      description: obsidian_blog_post.description
    }
  }.to_json
end

p response.body
