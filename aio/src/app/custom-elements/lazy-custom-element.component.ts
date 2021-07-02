import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Logger } from 'app/shared/logger.service';
import {unwrapHtmlForSink} from 'safevalues';
import {htmlFromStringKnownToSatisfyTypeContract} from 'safevalues/unsafe/reviewed';
import { ElementsLoader } from './elements-loader';

@Component({
  selector: 'aio-lazy-ce',
  template: '',
})
export class LazyCustomElementComponent implements OnInit {
  @Input() selector = '';

  constructor(
    private elementRef: ElementRef,
    private elementsLoader: ElementsLoader,
    private logger: Logger,
  ) {}

  ngOnInit() {
    if (!this.selector || /[^\w-]/.test(this.selector)) {
      this.logger.error(new Error(`Invalid selector for 'aio-lazy-ce': ${this.selector}`));
      return;
    }

    this.elementRef.nativeElement.innerHTML =
        unwrapHtmlForSink(htmlFromStringKnownToSatisfyTypeContract(
            `<${this.selector}></${this.selector}>`, 'selector is validated'));
    this.elementsLoader.loadCustomElement(this.selector);
  }
}
