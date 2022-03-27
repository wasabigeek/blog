require 'minitest/autorun'
require_relative '../obsidian_blog_post'

class ObsidianBlogPostTest < Minitest::Test
  def setup
    # Dir.pwd is based on running this from /obsidian folder
    Obsidian.directory = File.join(Dir.pwd, 'test/fixtures')
  end

  def teardown
    Obsidian.directory = nil
  end

  def parse_blog_post
    ObsidianBlogPost.from_filename('example_obsidian_blog_post')
    # ObsidianBlogPost.from_markdown_file(File.join(Dir.pwd, 'test/fixtures/example_obsidian_blog_post.md'))
  end

  def test_title
    blog_post = parse_blog_post
    assert_equal(
      blog_post.title,
      'Reading a Ruby gem with VSCode'
    )
  end

  def test_description
    blog_post = parse_blog_post
    assert_equal(
      blog_post.description,
      "Steps to try when investigating a gem's implementation in VSCode, using mocha's any_instance as an example."
    )
  end

  def test_tags
    blog_post = parse_blog_post
    assert_equal(
      blog_post.tags,
      %w[ruby vscode]
    )
  end

  def test_frontmatter_hash
    blog_post = parse_blog_post
    assert_equal(
      blog_post.send(:frontmatter_hash),
      {
        title: 'Reading a Ruby gem with VSCode',
        date: '2022-02-15',
        description: "Steps to try when investigating a gem's implementation in VSCode, using mocha's any_instance as an example.",
        published: true,
        tags: %w[ruby vscode]
      }
    )
  end

  def test_asset_filenames
    blog_post = parse_blog_post
    assert_includes(
      blog_post.asset_filenames,
      'Mocha opened in VSCode.png'
    )
  end

  def test_github_markdown_string_replaces_image_urls
    blog_post = parse_blog_post
    assert_includes(
      blog_post.github_markdown_string,
      '![Mocha opened in VSCode.png](./Mocha opened in VSCode.png)'
    )
  end

  def test_to_devto_markdown_replaces_image_urls
    blog_post = parse_blog_post
    assert_includes(
      blog_post.to_devto_markdown,
      # original: '![Mocha opened in VSCode.png](./Mocha opened in VSCode.png)'
      '![Mocha opened in VSCode.png](https://raw.githubusercontent.com/wasabigeek/blog/main/content/blog/reading-a-ruby-gem-with-vscode/Mocha%20opened%20in%20VSCode.png)'
    )
  end
end
