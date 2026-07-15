# ColorVision

A review tool that shows how status badges, chart colours and a card look under each kind of colour-vision deficiency.

It is not a product component. It applies protan, deutan, tritan and greyscale matrices to the status badges, the six chart series and a card. A matrix here is a colour filter that imitates one type of colour blindness. It runs in light, dark and high contrast. Anyone can then see what the numbers in the High contrast and colour vision section mean.

- The dots row shows status as colour alone. It is there to show why the system forbids it.
- The theme switch sets `data-theme` on the stage only. The rest of the page keeps the viewer's theme.
- The matrices are the standard Machado-style simulation that design tools use. They are an approximation, so the validator numbers are the record.
