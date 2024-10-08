# Seedcode-Facturación-Electrónica

**Seedcode-Facturación-Electrónica** es una biblioteca diseñada para la generación de facturas electrónicas según los estándares aplicables.

## Instalación

Para instalar la biblioteca, ejecuta el siguiente comando:

```bash
npm install seedcode-facturacion-electronica
```

## Uso

Importa la función principal `generate_factura` y utiliza los parámetros requeridos para generar una factura electrónica.

```typescript
import { generate_factura } from "seedcode-facturacion-electronica";

const factura = generate_factura(
  transmitter,          // Datos del emisor de la factura
  codEstable,           // Código del establecimiento del emisor
  codPuntoVenta,        // Código del punto de venta del emisor
  codEstableMH,         // Código del establecimiento MH (Ministerio de Hacienda)
  codPuntoVentaMH,      // Código del punto de venta MH (Ministerio de Hacienda)
  tipoEstablecimiento,  // Tipo de establecimiento del emisor
  nextCorrelative,      // Número correlativo de la factura
  products,             // Lista de productos o servicios
  customer,             // Datos del cliente
  condition,            // Condiciones de pago (ej. crédito, contado)
  tipo_pago,            // Tipo de pago (ej. efectivo, transferencia)
  ivaRete1,             // Retención de IVA aplicada
  ambiente              // Ambiente en que se genera la factura (ej. pruebas, producción)
);
```

## Parámetros

### 1. **transmitter**

El objeto `transmitter` contiene los datos del emisor de la factura. Este objeto incluye información esencial como claves, identificación, nombre, contacto y datos de la dirección.

```typescript
export interface ITransmitter {
  clavePrivada: string;        // Clave privada del emisor
  clavePublica: string;        // Clave pública del emisor
  claveApi: string;            // Clave API del emisor
  nit: string;                 // Número de Identificación Tributaria (NIT)
  nrc: string;                 // Número de Registro de Contribuyente (NRC)
  nombre: string;              // Nombre del emisor
  telefono: string;            // Teléfono de contacto del emisor
  correo: string;              // Correo electrónico del emisor
  descActividad: string;       // Descripción de la actividad comercial
  codActividad: string;        // Código de la actividad económica
  nombreComercial: string;     // Nombre comercial del emisor
  tipoEstablecimiento: string; // Tipo de establecimiento (ej. físico, virtual)
  codEstableMH: string;        // Código del establecimiento ante MH (Ministerio de Hacienda)
  codEstable: string;          // Código interno del establecimiento
  codPuntoVentaMH: string;     // Código del punto de venta ante MH
  codPuntoVenta: string;       // Código interno del punto de venta
  direccion: IAddress;         // Dirección del establecimiento
}
```

### 2. **direccion**

La dirección (`direccion`) del emisor es un objeto que contiene información detallada sobre la ubicación del establecimiento.

```typescript
export interface IAddress {
  departamento: string;   // Departamento o región del emisor
  municipio: string;      // Municipio del emisor
  complemento: string;    // Detalles adicionales de la dirección
}
```

### 3. **codEstable y codPuntoVenta**

- `codEstable`: Código único del establecimiento que identifica dónde se emite la factura.
- `codPuntoVenta`: Código único que identifica el punto de venta específico desde donde se realiza la operación.

### 4. **codEstableMH y codPuntoVentaMH**

- `codEstableMH`: Código del establecimiento registrado ante el Ministerio de Hacienda.
- `codPuntoVentaMH`: Código del punto de venta registrado ante el Ministerio de Hacienda.

### 5. **tipoEstablecimiento**

El tipo de establecimiento es una cadena de texto que describe el tipo de ubicación desde donde se emite la factura. Puede ser, por ejemplo, un local físico o una tienda en línea.

### 6. **products**

Un array que contiene los productos o servicios que forman parte de la factura. Debe incluir detalles como el nombre, la cantidad, el precio unitario y otros datos relevantes.

### 7. **customer**

El objeto `customer` contiene la información del cliente al que se le emite la factura, tales como nombre, identificación fiscal, y detalles de contacto.

### 8. **condition y tipo_pago**

- `condition`: Condiciones de pago de la factura (ej. crédito, contado).
- `tipo_pago`: Tipo de pago empleado para la transacción (ej. efectivo, tarjeta, transferencia).

### 9. **ivaRete1**

Porcentaje de retención de IVA aplicado a la transacción, en caso de que aplique.

### 10. **ambiente**

El ambiente en el que se emite la factura: puede ser de pruebas o producción, dependiendo del contexto de uso.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

--- 