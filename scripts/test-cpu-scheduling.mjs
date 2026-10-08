// Run with Node 22.18+ or Node 24: node --test scripts/test-cpu-scheduling.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { roundRobin, metrics } from '../src/components/scheduling/schedule.ts';

const processes = (bursts, arrivals = bursts.map(() => 0)) => bursts.map((burst, i) => ({ id: `P${i + 1}`, arrival: arrivals[i], burst }));

test('RR reproduces the seven quantum examples in the notes', () => {
    const input = processes([6, 3, 1, 7]);
    const expected = [11, 11.5, 10.75, 11.5, 12.25, 10.5, 10.5];
    for (let q = 1; q <= 7; q++) {
        const rows = metrics(input, roundRobin(input, q));
        assert.equal(rows.reduce((sum, r) => sum + r.turnaround, 0) / 4, expected[q - 1]);
    }
});

test('arrivals at the quantum boundary precede the unfinished process', () => {
    const input = processes([8, 4, 5, 3], [0, 1, 2, 3]);
    assert.deepEqual(roundRobin(input, 2).map(s => [s.id, s.start, s.end]), [
        ['P1', 0, 2], ['P2', 2, 4], ['P3', 4, 6], ['P1', 6, 8], ['P4', 8, 10],
        ['P2', 10, 12], ['P3', 12, 14], ['P1', 14, 16], ['P4', 16, 17], ['P3', 17, 18], ['P1', 18, 20],
    ]);
    assert.deepEqual(metrics(input, roundRobin(input, 2)).map(r => r.turnaround), [20, 11, 16, 14]);
});

test('long bursts and early completion match q=20 reference', () => {
    const input = processes([53, 17, 68, 24]);
    assert.deepEqual(metrics(input, roundRobin(input, 20)).map(r => r.completion), [134, 37, 162, 121]);
});

test('CPU is idle before the first arrival and across gaps', () => {
    assert.deepEqual(roundRobin(processes([2, 1], [3, 8]), 2), [
        { id: 'Idle', start: 0, end: 3 }, { id: 'P1', start: 3, end: 5 },
        { id: 'Idle', start: 5, end: 8 }, { id: 'P2', start: 8, end: 9 },
    ]);
});

test('all embedded schedules conserve bursts and respect arrivals across every allowed q', () => {
    const note = readFileSync(new URL('../src/content/posts/Operating_Systems/5_CPU_Scheduling.md', import.meta.url), 'utf8');
    for (const [tag] of note.matchAll(/<cpu-scheduling\s[^>]+>/g)) {
        const attr = name => tag.match(new RegExp(`data-${name}="([^"]+)"`))?.[1].replaceAll('&quot;', '"');
        const input = JSON.parse(attr('processes'));
        const fixed = attr('segments');
        for (let q = 1; q <= (fixed ? 1 : Number(attr('max'))); q++) {
            const segments = fixed ? JSON.parse(fixed) : roundRobin(input, q);
            for (const p of input) {
                const runs = segments.filter(s => s.id === p.id);
                assert.equal(runs.reduce((sum, s) => sum + s.end - s.start, 0), p.burst);
                assert.ok(runs.every(s => s.start >= p.arrival));
            }
            for (const [i, s] of segments.entries()) {
                assert.ok(s.end > s.start);
                if (i) assert.equal(segments[i - 1].end, s.start);
            }
            assert.ok(metrics(input, segments).every(r => r.waiting >= 0 && r.response >= 0));
        }
    }
});
