import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportMenu from '../components/ExportMenu';

describe('ExportMenu', () => {
  const mockProps = {
    onExportPDF: vi.fn(),
    onExportPPTX: vi.fn(),
    onExportImages: vi.fn(),
    onExportCurrentSlide: vi.fn(),
    onStartPresentation: vi.fn(),
    onSave: vi.fn(),
    onLoad: vi.fn(),
    isDownloading: false,
    disabled: false,
  };

  it('renderiza el botón principal', () => {
    render(<ExportMenu {...mockProps} />);
    expect(screen.getByText(/Exportar \/ Más/)).toBeInTheDocument();
  });

  it('abre el menú al hacer click en el botón', () => {
    render(<ExportMenu {...mockProps} />);

    const button = screen.getByText(/Exportar \/ Más/);
    fireEvent.click(button);

    expect(screen.getByText(/Slide Actual/)).toBeInTheDocument();
    expect(screen.getByText(/Todas las Imágenes/)).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('PowerPoint')).toBeInTheDocument();
  });

  it('llama a onExportPDF cuando se selecciona PDF', () => {
    render(<ExportMenu {...mockProps} />);

    fireEvent.click(screen.getByText(/Exportar \/ Más/));
    fireEvent.click(screen.getByText('PDF'));

    expect(mockProps.onExportPDF).toHaveBeenCalledTimes(1);
  });

  it('llama a onExportPPTX cuando se selecciona PowerPoint', () => {
    render(<ExportMenu {...mockProps} />);

    fireEvent.click(screen.getByText(/Exportar \/ Más/));
    fireEvent.click(screen.getByText('PowerPoint'));

    expect(mockProps.onExportPPTX).toHaveBeenCalledTimes(1);
  });

  it('llama a onStartPresentation cuando se selecciona Modo Presentación', () => {
    render(<ExportMenu {...mockProps} />);

    fireEvent.click(screen.getByText(/Exportar \/ Más/));
    fireEvent.click(screen.getByText(/Modo Presentación/));

    expect(mockProps.onStartPresentation).toHaveBeenCalledTimes(1);
  });

  it('deshabilita el botón cuando isDownloading es true', () => {
    render(<ExportMenu {...mockProps} isDownloading={true} />);

    const button = screen.getByText(/Exportar \/ Más/).closest('button');
    expect(button).toBeDisabled();
  });

  it('deshabilita el botón cuando disabled es true', () => {
    render(<ExportMenu {...mockProps} disabled={true} />);

    const button = screen.getByText(/Exportar \/ Más/).closest('button');
    expect(button).toBeDisabled();
  });

  it('cierra el menú después de seleccionar una opción', () => {
    render(<ExportMenu {...mockProps} />);

    fireEvent.click(screen.getByText(/Exportar \/ Más/));
    expect(screen.getByText('PDF')).toBeInTheDocument();

    fireEvent.click(screen.getByText('PDF'));

    // El menú debería estar cerrado ahora
    expect(screen.queryByText('PDF')).not.toBeInTheDocument();
  });

  it('muestra opciones de Guardar y Cargar', () => {
    render(<ExportMenu {...mockProps} />);

    fireEvent.click(screen.getByText(/Exportar \/ Más/));

    expect(screen.getByText(/Guardar Presentación/)).toBeInTheDocument();
    expect(screen.getByText(/Cargar Presentación/)).toBeInTheDocument();
  });
});
