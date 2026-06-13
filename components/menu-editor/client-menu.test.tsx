import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ClientMenu } from './client-menu'

const mocks = vi.hoisted(() => {
  const defaultMenuStyle = {
    backgroundColor: '#fff7ea',
    primaryColor: '#9f1d25',
    secondaryColor: '#6f3b1e',
    textColor: '#24150f',
    priceColor: '#9f1d25',
    accentColor: '#d6a536',
    titleFontSize: 18,
    descriptionFontSize: 14,
    priceFontSize: 16,
    categoryFontSize: 26,
    fontFamily: 'Georgia',
    imageSize: 'medium',
    imagePosition: 'top',
    cardStyle: 'shadow',
    columns: 2,
    spacing: 'normal',
    textAlign: 'left',
    borderRadius: 8,
    showLogo: true,
    logoUrl: '/logo.svg',
    heroImageUrl: '/placeholder.jpg',
    headerText: 'El Rinconcito Español',
    headerSubtitle: 'Un menú inspirado en los sabores de España.',
    headerStyle: 'overlay'
  }

  const esCategories = [
    {
      id: 'bebidas',
      name: 'Bebidas',
      color: '#9f1d25',
      items: [
        {
          id: 'bebida-1',
          name: 'Nombre',
          description: 'Descripcion',
          price: 0,
          image: '/imagenes/bebida.jpg',
          category: 'bebidas'
        }
      ]
    }
  ]

  const enCategories = [
    {
      id: 'drinks',
      name: 'Drinks',
      color: '#9f1d25',
      items: [
        {
          id: 'bebida-1',
          name: 'Name',
          description: 'Description',
          price: 0,
          image: '/imagenes/bebida.jpg',
          category: 'drinks'
        }
      ]
    }
  ]

  return {
    defaultMenuStyle,
    categories: esCategories,
    menuDataByLanguage: {
      es: esCategories,
      en: enCategories
    }
  }
})

vi.mock('@/lib/types', () => ({
  defaultMenuStyle: mocks.defaultMenuStyle,
  menuDataByLanguage: mocks.menuDataByLanguage
}))

vi.mock('@/lib/menu-context', () => ({
  useMenu: () => ({
    categories: mocks.categories,
    style: mocks.defaultMenuStyle
  })
}))

describe('ClientMenu', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the Spanish drinks catalog', () => {
    render(<ClientMenu />)

    expect(screen.getByRole('button', { name: 'Bebidas' })).toBeInTheDocument()
    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Descripcion')).toBeInTheDocument()
    expect(screen.getByText('Precio pendiente')).toBeInTheDocument()
  })

  it('switches product names and category buttons when language changes', async () => {
    render(<ClientMenu />)

    fireEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(await screen.findByRole('button', { name: 'Drinks' })).toBeInTheDocument()
    expect(await screen.findByText('Name')).toBeInTheDocument()
    expect(await screen.findByText('Description')).toBeInTheDocument()
    expect(await screen.findByText('Price pending')).toBeInTheDocument()
  })

  it('uses category color on category buttons', () => {
    render(<ClientMenu />)

    const categoryButton = screen.getByRole('button', { name: 'Bebidas' })
    expect(categoryButton).toHaveStyle({ color: '#9f1d25' })
  })
})
