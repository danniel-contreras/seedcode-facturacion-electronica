# seedcode-facuracion-electronica

A library for generating electronic invoices.

## Installation

```bash
npm install seedcode-facuracion-electronica
```

## Usage

```typescript
import { generate_factura } from "seedcode-facuracion-electronica";

const factura = generate_factura(
  transmitter,
  codEstable,
  codPuntoVenta,
  codEstableMH,
  codPuntoVentaMH,
  tipoEstablecimiento,
  nextCorrelative,
  products,
  customer,
  condition,
  tipo_pago,
  ivaRete1,
  ambiente
);
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.