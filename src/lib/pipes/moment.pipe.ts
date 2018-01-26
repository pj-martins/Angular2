import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment-es6';

@Pipe({ name: 'moment' })
export class MomentPipe implements PipeTransform {
	transform(value: any, format: string) {
		if (!value)
			return '';
		let dt = moment(value);
		return dt.format(format);
	}
}