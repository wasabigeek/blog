class ObsidianBlogPost
  FILE_REGEX = /!\[\[(?<file>.+)\]\]/.freeze

  def initialize(original_markdown)
    @original_markdown = original_markdown
  end

  def self.from_markdown_file(path)
    new(File.open(path, 'r').read)
  end

  def asset_filenames
    @original_markdown.scan(FILE_REGEX).flatten
  end

  # TODO: extract - this depends on the Blog's format
  def to_blog_markdown
    @original_markdown
      .split('<!--REJECTED IDEAS-->')
      .first
      .gsub(/(?<!\!)\[\[(?<linktitle>.+)\]\]/, '\k<linktitle>')
      .gsub(FILE_REGEX, '![\k<file>](./\k<file>)')
  end
end
