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

  def description
    frontmatter_hash[:description]
  end

  def tags
    frontmatter_hash[:tags]
  end

  def title
    frontmatter_hash[:title]
  end

  # TODO: extract - this depends on the Blog's format
  def to_blog_markdown
    @original_markdown
      .split('<!--REJECTED IDEAS-->')
      .first
      .gsub(/(?<!\!)\[\[(?<linktitle>.+)\]\]/, '\k<linktitle>')
      .gsub(FILE_REGEX, '![\k<file>](./\k<file>)')
  end

  private

  def frontmatter_hash
    return @frontmatter_hash unless @frontmatter_hash.nil?

    raw_frontmatter = @original_markdown
                      .match(/---\n(?<raw_frontmatter>\X+)\n---\n/)
                      .named_captures['raw_frontmatter']

    @frontmatter_hash = raw_frontmatter
      .split("\n")
      .to_h do |item|
        key, value = item.split(': ').map(&:chomp)
        transformed_value = case key
                            when 'published'
                              value == 'true'
                            when 'tags'
                              value.scan(/["'](\w+)["']/).flatten
                            else
                              value.gsub('"', '')
                            end

        [
          key.to_sym,
          transformed_value
        ]
      end
  end
end
