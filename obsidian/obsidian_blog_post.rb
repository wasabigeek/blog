require 'active_support/inflector/methods'
require 'active_support/inflector/transliterate'
require 'erb'

module Obsidian
  class << self
    attr_accessor :directory

    def blog_directory
      File.join(Obsidian.directory, 'Blog/Published')
    end
  end
end

class ObsidianBlogFile
  attr_reader :absolute_path, :filename

  def initialize(filename)
    @filename = filename
    @absolute_path = File.join(
      Obsidian.directory,
      'Files',
      filename
    )
  end
end

class ObsidianBlogPost
  FILE_REGEX = /!\[\[(?<file>.+)\]\]/.freeze

  class << self
    def from_filename(filename)
      filename = "#{filename}.md" unless filename.end_with?('.md')
      filepath = File.join(Obsidian.directory, 'Blog/Published', filename)
      new(
        File.open(filepath, 'r').read,
        original_filename: filename
      )
    end
  end

  attr_reader :original_filename

  def initialize(original_markdown, original_filename:)
    @original_markdown = original_markdown
    @original_filename = original_filename
  end

  def original_filename_without_ext
    original_filename.sub('.md', '')
  end

  def asset_filenames
    @original_markdown.scan(FILE_REGEX).flatten
  end

  def files
    asset_filenames.map do |filename_with_ext|
      ObsidianBlogFile.new(filename_with_ext)
    end
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

  def github_markdown_string
    @original_markdown
      .split('<!--SCRATCHPAD-->')
      .first
      .gsub(/(?<!\!)\[\[(?<linktitle>.+)\]\]/, '\k<linktitle>')
      .gsub(FILE_REGEX, '![\k<file>](./\k<file>)')
  end

  def to_devto_markdown
    @original_markdown
      .split('<!--SCRATCHPAD-->')
      .first
      .gsub(/(?<!\!)\[\[(?<linktitle>.+)\]\]/, '\k<linktitle>')
      .gsub(FILE_REGEX) do |match|
        # eww
        filename = match.match(FILE_REGEX).named_captures['file']

        # this logic is somewhat tied to how the Blog is uploaded >_<
        "![#{filename}](https://raw.githubusercontent.com/wasabigeek/blog/main/content/blog/#{slugified_title}/#{ERB::Util.url_encode(filename)})"
      end
  end

  private

  def slugified_title
    ActiveSupport::Inflector.parameterize(title, separator: '-')
  end

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
