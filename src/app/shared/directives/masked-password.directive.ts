import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: 'input[maskedPassword]',
  standalone: true,
})
export class MaskedPasswordDirective implements OnInit, OnChanges {
  @Input('maskedPassword') masked: boolean | '' = true;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.renderer.setAttribute(this.el.nativeElement, 'type', 'text');
    this.applyMask();
  }

  ngOnChanges(): void {
    this.applyMask();
  }

  private applyMask(): void {
    const value = this.masked === false ? 'none' : 'disc';
    this.renderer.setStyle(this.el.nativeElement, '-webkit-text-security', value);
    this.renderer.setStyle(this.el.nativeElement, 'text-security', value);
  }
}
