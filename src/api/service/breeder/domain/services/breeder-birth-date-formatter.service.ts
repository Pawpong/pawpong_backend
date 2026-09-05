import { Injectable } from '@nestjs/common';

@Injectable()
export class BreederBirthDateFormatterService {
    formatToKorean(date: Date | string | undefined): string {
        if (!date) return '';
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return '';

        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');

        return `${year}년 ${month}월 ${day}일 생`;
    }
}
