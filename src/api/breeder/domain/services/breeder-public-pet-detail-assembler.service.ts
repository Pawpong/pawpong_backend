import { Injectable } from '@nestjs/common';

@Injectable()
export class BreederPublicPetDetailAssemblerService {
    toResponse(pet: any) {
        const father = pet.parentInfo?.father;
        const mother = pet.parentInfo?.mother;

        return {
            petId: pet._id.toString(),
            name: pet.name,
            breed: pet.breed,
            gender: pet.gender,
            birthDate: pet.birthDate,
            description: pet.description || '',
            price: pet.price,
            status: pet.status,
            photos: pet.photos || [],
            vaccinations: pet.vaccinations || [],
            healthRecords: pet.healthRecords || [],
            father: father
                ? {
                      petId: father._id.toString(),
                      name: father.name,
                      breed: father.breed,
                      photo: father.photos?.[0] || '',
                  }
                : undefined,
            mother: mother
                ? {
                      petId: mother._id.toString(),
                      name: mother.name,
                      breed: mother.breed,
                      photo: mother.photos?.[0] || '',
                  }
                : undefined,
            availableFrom: pet.availableFrom,
            microchipNumber: pet.microchipNumber,
            specialNotes: pet.specialNotes,
            createdAt: pet.createdAt,
        };
    }
}
