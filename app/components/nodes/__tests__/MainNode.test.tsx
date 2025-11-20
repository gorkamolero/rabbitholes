import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MainNode from '../MainNode'
import '@testing-library/jest-dom/vitest'

// Mock React Flow
vi.mock('reactflow', () => ({
  Handle: ({ type, position }: any) => <div data-testid={`handle-${type}`} />,
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
}))

// Mock BounceCards
vi.mock('../../ui/bounce-cards', () => ({
  BounceCards: ({ images }: { images: string[] }) => (
    <div data-testid="bounce-cards">
      {images.map((img, i) => (
        <img key={i} src={img} alt="" data-testid={`bounce-image-${i}`} />
      ))}
    </div>
  ),
}))

// Mock ReactMarkdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown-content">{children}</div>,
}))

describe('MainNode Component', () => {
  it('renders markdown content correctly', () => {
    const data = {
      label: 'Test Topic',
      content: '## Test Heading\n\nTest content here.',
      images: [],
      sources: [],
    }

    render(<MainNode data={data} id="1" type="main" />)

    expect(screen.getByTestId('markdown-content')).toHaveTextContent('## Test Heading')
    expect(screen.getByTestId('markdown-content')).toHaveTextContent('Test content here.')
  })

  it('displays image carousel when images provided', () => {
    const data = {
      label: 'Test',
      content: 'Content',
      images: [
        'https://example.com/img1.jpg',
        'https://example.com/img2.jpg',
        'https://example.com/img3.jpg',
      ],
      sources: [],
    }

    render(<MainNode data={data} id="1" type="main" />)

    expect(screen.getByTestId('bounce-cards')).toBeInTheDocument()
    expect(screen.getByTestId('bounce-image-0')).toHaveAttribute('src', 'https://example.com/img1.jpg')
  })

  it('shows source links with favicons', () => {
    const data = {
      label: 'Test',
      content: 'Content',
      images: [],
      sources: [
        {
          title: 'Example Article',
          url: 'https://example.com/article',
        },
        {
          title: 'Another Source',
          url: 'https://another.com/source',
        },
      ],
    }

    render(<MainNode data={data} id="1" type="main" />)

    expect(screen.getByText('Sources')).toBeInTheDocument()
    expect(screen.getByText('Example Article')).toBeInTheDocument()
    expect(screen.getByText('Another Source')).toBeInTheDocument()

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', 'https://example.com/article')
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('displays loading spinner during data fetch', () => {
    const data = {
      label: 'Loading',
      content: 'Loading...',
      images: [],
      sources: [],
    }

    render(<MainNode data={data} id="1" type="main" />)

    expect(screen.getByText('SEEKING WISDOM')).toBeInTheDocument()
    expect(screen.getByText('Traversing the depths of knowledge...')).toBeInTheDocument()
    expect(screen.queryByTestId('markdown-content')).not.toBeInTheDocument()
  })

  it('handles missing/broken images gracefully', () => {
    const data = {
      label: 'Test',
      content: 'Content',
      images: [],
      sources: [
        {
          title: 'Test Source',
          url: 'invalid-url',
        },
      ],
    }

    render(<MainNode data={data} id="1" type="main" />)

    // Should still render the source even with invalid URL
    expect(screen.getByText('Test Source')).toBeInTheDocument()
    expect(screen.getByText('Sources')).toBeInTheDocument()

    // The link should still be clickable
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'invalid-url')
  })

  it('limits images to 5 maximum', () => {
    const data = {
      label: 'Test',
      content: 'Content',
      images: [
        'img1.jpg',
        'img2.jpg',
        'img3.jpg',
        'img4.jpg',
        'img5.jpg',
        'img6.jpg',
        'img7.jpg',
      ],
      sources: [],
    }

    render(<MainNode data={data} id="1" type="main" />)

    const images = screen.getAllByTestId(/bounce-image-/)
    expect(images).toHaveLength(5)
  })

  it('renders React Flow handles for connections', () => {
    const data = {
      label: 'Test',
      content: 'Content',
      images: [],
      sources: [],
    }

    render(<MainNode data={data} id="1" type="main" />)

    expect(screen.getByTestId('handle-target')).toBeInTheDocument()
    expect(screen.getByTestId('handle-source')).toBeInTheDocument()
  })
})
