<?php
/**
 * Template for displaying the instructor of a course
 *
 * @author  ThimPress
 * @package LearnPress/Templates
 * @version 3.x.x
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

$course = LP_Global::course();
?>

<div class="course-author-box">
	<h3><?php _e('About the Instructor', 'learnpress');?></h3>
	<p><?php echo $course->get_instructor_html();?></p>
	<div>
		<?php echo $course->get_author()->get_description();?>
	</div>
</div>