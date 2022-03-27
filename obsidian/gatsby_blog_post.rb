class GatsbyBlogPost
  class << self
    attr_writer :directory

    def create_from(obsidian_blog_post)
      directory = "../content/blog/#{parameterize(obsidian_blog_post.original_filename)}/"
      FileUtils.mkdir_p(directory)
      # copy files
      obsidian_blog_post.files.each do |obsidian_blog_file|
        FileUtils.copy(
          obsidian_blog_file.absolute_path,
          File.join(directory, obsidian_blog_file.filename)
        )
      end

      File.open("#{directory}/index.md", 'w+') do |file|
        file.write(obsidian_blog_post.github_markdown_string)
      end
    end

    private

    def parameterize(word)
      ActiveSupport::Inflector.parameterize(word, separator: '-')
    end
  end
end
