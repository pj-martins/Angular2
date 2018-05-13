import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment-timezone-es6';

@Pipe({ name: 'moment' })
export class MomentPipe implements PipeTransform {
	transform(value: any, format: string, timezone: string) {
		if (!value)
			return '';
		let dt: any;
		if (!timezone)
			dt = moment(value);
		else
			dt = moment.tz(value, timezone);
		return dt.format(format);
	}
}