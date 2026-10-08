export interface Process {
	id: string;
	arrival: number;
	burst: number;
}
export interface Segment {
	id: string;
	start: number;
	end: number;
}

// Arrivals at a quantum boundary enter the queue before the unfinished process.
export function roundRobin(processes: Process[], quantum: number): Segment[] {
	if (!Number.isFinite(quantum) || quantum <= 0)
		throw new Error("Invalid quantum");
	const pending = processes
		.map((p) => ({ ...p, remaining: p.burst }))
		.sort((a, b) => a.arrival - b.arrival);
	const queue: typeof pending = [];
	const segments: Segment[] = [];
	let time = 0;
	let next = 0;
	const enqueue = () => {
		while (next < pending.length && pending[next].arrival <= time)
			queue.push(pending[next++]);
	};
	while (next < pending.length || queue.length) {
		enqueue();
		if (!queue.length) {
			const end = pending[next].arrival;
			if (end > time) segments.push({ id: "Idle", start: time, end });
			time = end;
			enqueue();
		}
		const p = queue.shift()!;
		const duration = Math.min(quantum, p.remaining);
		segments.push({ id: p.id, start: time, end: time + duration });
		time += duration;
		p.remaining -= duration;
		enqueue();
		if (p.remaining > 0) queue.push(p);
	}
	return segments;
}

export function metrics(processes: Process[], segments: Segment[]) {
	return processes.map((p) => {
		const runs = segments.filter((s) => s.id === p.id);
		const completion = runs.at(-1)!.end;
		const turnaround = completion - p.arrival;
		return {
			...p,
			completion,
			turnaround,
			waiting: turnaround - p.burst,
			response: runs[0].start - p.arrival,
		};
	});
}
