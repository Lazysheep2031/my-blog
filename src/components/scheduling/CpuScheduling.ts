import { metrics, roundRobin, type Process, type Segment } from "./schedule";

const colors: Record<string, string> = {
	P1: "#93c5fd",
	P2: "#6ee7b7",
	P3: "#fcd94f",
	P4: "#d8b4fe",
	P5: "#f9a8d4",
	Idle: "#d1d5db",
};
const formatTime = (value: number) => Number(value.toFixed(4)).toString();
const styles = `
:host{display:block;margin:1.5rem 0;color:inherit;font-family:inherit;line-height:1.6}
*{box-sizing:border-box}.card{border:1px solid #8884;border-radius:18px;padding:22px;background:var(--card-bg,transparent)}
header{display:flex;align-items:center;justify-content:space-between;gap:12px}h4{margin:0;font-size:1.12rem;font-weight:700}output{border-radius:20px;background:#8881;padding:2px 12px;white-space:nowrap;font-variant-numeric:tabular-nums}
.controls{margin:18px 0 0}label{font-size:.88rem}input{display:block;width:100%;height:14px;margin:16px 0;appearance:none;-webkit-appearance:none;border-radius:99px;background:#8882;cursor:pointer}input::-webkit-slider-thumb{appearance:none;-webkit-appearance:none;width:24px;height:24px;border:2px solid #ddd;border-radius:50%;background:#fff;box-shadow:0 1px 4px #0002}input::-moz-range-thumb{width:22px;height:22px;border:2px solid #ddd;border-radius:50%;background:#fff}input:focus-visible{outline:2px solid #689fe4;outline-offset:6px}.range{display:flex;justify-content:space-between;font-size:.8rem;opacity:.65}
.legend{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:18px;font-size:.8rem;opacity:.85}.dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px}
.scroll{overflow-x:auto;padding:28px 12px 8px;overscroll-behavior-x:contain}.timeline{position:relative;height:137px;margin:0 10px}.block{position:absolute;top:0;height:80px;padding:0 2px}.block span{height:100%;display:flex;align-items:center;justify-content:center;border-radius:9px;background:var(--fill);color:#192332;font-size:1.18rem;font-weight:600}.tick{position:absolute;top:88px;transform:translateX(-50%);font-size:.83rem;font-variant-numeric:tabular-nums;white-space:nowrap}.tick.odd{top:111px}
.completions{display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:12px;text-align:center;margin:10px 0 22px}.caption{font-size:.8rem;opacity:.65}.value{font-size:1.4rem;font-weight:650;font-variant-numeric:tabular-nums}.averages{border-top:1px solid #8883;padding-top:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.formula{font-size:.8rem;opacity:.7;margin-top:12px;overflow-wrap:anywhere}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:.8rem;text-align:right;margin-top:12px}th,td{padding:6px;border-bottom:1px solid #8883;white-space:nowrap}th:first-child,td:first-child{text-align:left}details{margin-top:14px}summary{font-size:.8rem;cursor:pointer}
@media(max-width:480px){.completions{grid-template-columns:repeat(2,minmax(0,1fr))}.card{padding:15px}.value{font-size:1.2rem}h4{font-size:1rem}.caption{font-size:.72rem}.scroll{padding-top:22px}}`;

class CpuScheduling extends HTMLElement {
	connectedCallback() {
		if (this.shadowRoot) return;
		const processes: Process[] = JSON.parse(this.dataset.processes!);
		const fixed: Segment[] | null = this.dataset.segments
			? JSON.parse(this.dataset.segments)
			: null;
		const initial = Number(this.dataset.quantum || 2);
		const max = Number(
			this.dataset.max || Math.max(...processes.map((p) => p.burst)),
		);
		const root = this.attachShadow({ mode: "open" });
		root.innerHTML = `<style>${styles}</style><section class="card"><header><h4></h4>${fixed ? "" : '<output aria-live="polite"></output>'}</header>${fixed ? "" : `<div class="controls"><label for="quantum">时间片 q（拖动或使用方向键）</label><input id="quantum" type="range" min="1" max="${max}" step="1" value="${initial}"><div class="range"><span>1</span><span>${max}</span></div></div>`}<div class="legend"></div><div class="result"></div></section>`;
		root.querySelector("h4")!.textContent =
			this.dataset.title || "CPU 调度甘特图";
		root.querySelector(".legend")!.innerHTML = processes
			.map(
				(p) =>
					`<span><i class="dot" style="background:${colors[p.id] || colors.Idle}"></i>${p.id} · 到达 ${p.arrival} / 执行 ${p.burst}</span>`,
			)
			.join("");
		const render = (q: number) => {
			const segments = fixed || roundRobin(processes, q);
			const rows = metrics(processes, segments);
			const total = segments.at(-1)!.end;
			// Preserve proportional widths while keeping the shortest segment legible on phones.
			const shortest = Math.min(...segments.map((s) => s.end - s.start));
			const width = Math.max(480, (total / shortest) * 36);
			const mean = (key: "turnaround" | "waiting" | "response") =>
				(rows.reduce((sum, r) => sum + r[key], 0) / rows.length).toFixed(2);
			const output = root.querySelector("output");
			if (output) output.textContent = `q = ${q}`;
			root.querySelector(".result")!.innerHTML =
				`<div class="scroll" tabindex="0" role="region" aria-label="甘特图，可横向滚动；详细时间线见下方表格"><div class="timeline" style="min-width:${width}px">${segments.map((s) => `<div class="block" style="left:${(s.start / total) * 100}%;width:${((s.end - s.start) / total) * 100}%;--fill:${colors[s.id] || colors.Idle}" title="${s.id}: ${s.start}–${s.end}（${s.end - s.start}）"><span>${s.id === "Idle" ? "空闲" : s.id}</span></div>`).join("")}${[...segments.map((s) => s.start), total].map((t, i) => `<span class="tick ${i % 2 ? "odd" : ""}" style="left:${(t / total) * 100}%">${t}</span>`).join("")}</div></div><div class="completions">${rows.map((r) => `<div><div class="caption">${r.id} 完成</div><div class="value">${r.completion}</div></div>`).join("")}</div><div class="averages" aria-live="polite"><div><div class="caption">平均周转时间</div><div class="value">${mean("turnaround")}</div></div><div><div class="caption">平均等待时间</div><div class="value">${mean("waiting")}</div></div><div><div class="caption">平均响应时间</div><div class="value">${mean("response")}</div></div></div><div class="formula">平均周转 = (${rows.map((r) => (r.arrival ? `(${r.completion} − ${r.arrival})` : r.completion)).join(" + ")}) / ${rows.length} = ${mean("turnaround")}</div><details><summary>查看各进程指标与完整时间线</summary><div class="table-wrap"><table><thead><tr><th>进程</th><th>完成 C</th><th>周转 T</th><th>等待 W</th><th>响应 R</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r.id}</td><td>${r.completion}</td><td>${formatTime(r.turnaround)}</td><td>${formatTime(r.waiting)}</td><td>${formatTime(r.response)}</td></tr>`).join("")}</tbody></table></div><p class="formula">${segments.map((s) => `${s.start}–${s.end} ${s.id}`).join(" → ")}</p></details>`;
		};
		render(initial);
		root
			.querySelector("input")
			?.addEventListener("input", (event) =>
				render(Number((event.target as HTMLInputElement).value)),
			);
	}
}
// Custom elements also upgrade content inserted by Swup, including cached navigation.
if (!customElements.get("cpu-scheduling"))
	customElements.define("cpu-scheduling", CpuScheduling);
