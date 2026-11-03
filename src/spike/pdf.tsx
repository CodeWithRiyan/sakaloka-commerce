import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import { timed, type SpikeResult } from './types';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11 },
  title: { fontSize: 24, marginBottom: 16 },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, paddingVertical: 4 },
  cell: { flex: 1 },
});

// 500 player rows: the most a uniform order allows.
const players = Array.from({ length: 500 }, (_, i) => ({
  name: `Player ${i + 1}`,
  number: String(i + 1),
  size: 'Adult / L',
}));

function SampleOrder() {
  return (
    <Document title="I2I-2026-000001">
      <Page size="A3" style={styles.page}>
        <Text style={styles.title}>Order I2I-2026-000001 (spike)</Text>
        {players.map((p) => (
          <View key={p.number} style={styles.row} wrap={false}>
            <Text style={styles.cell}>{p.name}</Text>
            <Text style={styles.cell}>{p.number}</Text>
            <Text style={styles.cell}>{p.size}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function renderSamplePdf(): Promise<Buffer> {
  return renderToBuffer(<SampleOrder />);
}

export async function spikePdf(): Promise<SpikeResult[]> {
  const { value, ms } = await timed(renderSamplePdf);
  const text = value.subarray(0, 2000).toString('latin1');
  // A3 portrait is 841.89 x 1190.55 points.
  const isA3 = /MediaBox\s*\[\s*0 0 841\.89\d* 1190\.55\d*\s*\]/.test(value.toString('latin1'));
  return [
    {
      name: 'A3 PDF with 500 player rows',
      pass: text.startsWith('%PDF-') && isA3,
      detail: `${ms} ms, ${Math.round(value.length / 1024)} KiB, A3 MediaBox ${isA3 ? 'found' : 'missing'}`,
    },
  ];
}
