import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Router, RouterLink } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { LocalStorageService } from '../../services/local-storage.service';


@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [NgOptimizedImage, CommonModule, HeaderComponent, PaginatorModule, RouterLink],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.css'
})
export class QuestionsComponent implements OnInit {

  constructor(private requestService:RequestService, private localStorageService: LocalStorageService, private router: Router) {}

  //************************* DEFINICIÓN DE VARIABLES ****************************//

  examQuestion:any = this.localStorageService.getItem("examQuestions"); //aquí se guardan las preguntas del examen
  idReportedQuestion: number | null = null; //aquí se guardan las preguntas reportadas
  reportedQuestion: string[] = [];
  userResponses: { quizId: number, optionSelected: string }[] = []; // Array para almacenar las respuestas del usuario

  page: any = {page: 0, first:0}
  questionsPerPage:number = 20;



  //************************* ngOnInit ****************************//

  ngOnInit(): void {
    // Inicializar userResponses con el id de cada pregunta y optionSelected como vacío
    this.userResponses = this.examQuestion.map((question: any) => {
      return {
        quizId: question.id,
        optionSelected: "" // Inicialmente vacío
      };
    });

    //para recorrer las opciones de respuestas
    this.examQuestion = this.examQuestion.map((question:any) => {
      return {
        ...question,
        respuestas: [question.option1, question.option2, question.option3, question.option4]
      };
    });
    console.log(this.examQuestion); // Verificar los datos de las preguntas
    console.log(this.userResponses); // Verificar el array de respuestas inicializado
  }




  //************************* FUNCIONES PARA RECOGER LAS OPCIONES SEÑALADAS EN EL EXAMEN ****************************//

  onSelectAnswer(questionIndex: number, answer: string) {
    // Actualizar la opción seleccionada en userResponses
    this.userResponses[questionIndex].optionSelected = answer;
    console.log(this.userResponses); // Para verificar las respuestas seleccionadas
  }

 

  //************************* FUNCIONES PARA APERTURA, CIERRE y ENVIO DEL MODAL DE REPORTE ****************************//

  openModal(questionId:number) {
    this.idReportedQuestion = questionId; // Almacena el ID de la pregunta seleccionada
    const modalReport = document.getElementById('reportModal');
    const reportReason = (document.getElementById('reportReason') as HTMLTextAreaElement);
    if (modalReport) {
      modalReport.classList.remove('hidden');
      reportReason.value = ''; // Limpiar el campo del motivo del reporte
      console.log(questionId);
    }
  }

  closeModal() {
    this.idReportedQuestion = null; // Limpiar el ID seleccionado
    const modalReport = document.getElementById('reportModal');
    if (modalReport) {
      modalReport.classList.add('hidden');
      console.log("se da en cancelar ahora");
    }
  }

  async sendReport() {
    const modal = document.getElementById('reportModal');
    // Obtener el motivo del reporte desde el textarea
    const reportReason = (document.getElementById('reportReason') as HTMLTextAreaElement).value;
    // Verifica que el campo no esté vacío
    if (!reportReason || reportReason.trim().length === 0) {
      console.log("El campo del motivo no puede estar vacío");
      return;
    }
    // realizar la petición del reporte
    try{
      this.reportedQuestion = await this.requestService.request('POST', `http://localhost:3000/report`,{reason: reportReason, quizId:this.idReportedQuestion},{},true);
      //Guardar las preguntas generadas en localStorage
      console.log(this.reportedQuestion);
      console.log(this.idReportedQuestion);
      if (modal) {
        modal.classList.add('hidden');
      }
      this.idReportedQuestion = null; // Limpia el ID seleccionado tras el envío
      alert("se ha enviado el reporte de la pregunta.");
    }catch(error: any){
      console.log(error);
    }
  }




  //************************* FUNCIONES PARA CONTROLAR LA PAGINACIÓN Y PREGUNTAS POR PÁGINA ****************************//

  onPageChange($event: PaginatorState) {
    this.page = $event;
    console.log($event)
  }

  progress() {
    const endQuestion = Math.min((this.page.page + 1) * this.questionsPerPage, this.examQuestion.length);
    const progress = (endQuestion / this.examQuestion.length) * 100;
    return Math.min(progress, 100); // para asegurar de que el valor no exceda 100%
  }

  progressText() {
    const startQuestion = this.page.page  * this.questionsPerPage + 1;
    const endQuestion = Math.min((this.page.page+1) * this.questionsPerPage, this.examQuestion.length);
    return `${startQuestion}-${endQuestion} de ${this.examQuestion.length}`;
  }




  //************************* FUNCIÓNES PARA EL ENVÍO DEL TEST ****************************//

  openModalTest() {
    const modalTest = document.getElementById('finishTest');
    if (modalTest) {
      modalTest.classList.remove('hidden');
    }
  }

  closeModalTest() {
    const modalTest = document.getElementById('finishTest');
    if (modalTest) {
      modalTest.classList.add('hidden');
      console.log("se da en cancelar envio del test");
    }
  }

  async sendTest() {
    try{
      // Encapsula el array userResponses dentro de un objeto con la clave 'quizzes'
      const payload = {quizzes: this.userResponses};

      // Hacer la petición POST al backend para corregir el examen
      const response = await this.requestService.request('POST', 'http://localhost:3000/quiz/check', payload, {}, true);
      console.log('Resultados del examen:', response);

      // Guardar las preguntas corregidas y las respuestas del usuario en el localStorage
      this.localStorageService.setItem('correctedExamQuestions', response.quizzes);
      this.localStorageService.setItem('userAnswer', this.userResponses);

      // Redirigir al componente de chequeo de examen
      this.router.navigate(['/check-exam']);

      //eliminar del localStorage las preguntas del examen
      this.localStorageService.removeItem('examQuestions')

    }catch(error){
      console.log('Error al enviar el examen: ',error);
    }
    const modalTest = document.getElementById('finishTest');
    if (modalTest) {
      modalTest.classList.add('hidden');
    }
  }

}
