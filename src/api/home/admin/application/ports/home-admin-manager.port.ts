import { BannerCreateRequestDto } from '../../dto/request/banner-create-request.dto';
import { BannerUpdateRequestDto } from '../../dto/request/banner-update-request.dto';
import { FaqCreateRequestDto } from '../../dto/request/faq-create-request.dto';
import { FaqUpdateRequestDto } from '../../dto/request/faq-update-request.dto';
import { HomeBannerSnapshot, HomeFaqSnapshot } from '../../../application/ports/home-content-reader.port';

export const HOME_ADMIN_MANAGER = Symbol('HOME_ADMIN_MANAGER');

export interface HomeAdminManagerPort {
    readAllBanners(): Promise<HomeBannerSnapshot[]>;
    createBanner(data: BannerCreateRequestDto): Promise<HomeBannerSnapshot>;
    updateBanner(bannerId: string, data: BannerUpdateRequestDto): Promise<HomeBannerSnapshot | null>;
    deleteBanner(bannerId: string): Promise<boolean>;

    readAllFaqs(): Promise<HomeFaqSnapshot[]>;
    createFaq(data: FaqCreateRequestDto): Promise<HomeFaqSnapshot>;
    updateFaq(faqId: string, data: FaqUpdateRequestDto): Promise<HomeFaqSnapshot | null>;
    deleteFaq(faqId: string): Promise<boolean>;
}
